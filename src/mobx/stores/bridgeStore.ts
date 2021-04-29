import firebase from 'firebase';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import BigNumber from 'bignumber.js';
import { provider } from 'web3-core';
import { AbiItem } from 'web3-utils';
import _ from 'lodash';
import GatewayJS from '@renproject/gateway';
import { Gateway } from '@renproject/gateway';
import { LockAndMintStatus, BurnAndReleaseStatus, LockAndMintEvent, BurnAndReleaseEvent } from '@renproject/interfaces';
import { extendObservable, action, observe, IValueDidChange, toJS } from 'mobx';
import { retry } from '@lifeomic/attempt';

import fbase from 'fbase';
import { RootStore } from '../store';
import WalletStore from './walletStore';
import { RenVMTransaction, Network } from 'mobx/model';
import {
	// abis
	ERC20,
	// config
	NETWORK_LIST,
	RENVM_GATEWAY_ADDRESS,
	FLAGS,
} from 'config/constants';
import { BADGER_ADAPTER } from 'config/system/abis/BadgerAdapter';
import { BTC_GATEWAY } from 'config/system/abis/BtcGateway';
import { bridge_system, tokens, sett_system } from 'config/deployments/mainnet.json';
import { shortenAddress } from 'utils/componentHelpers';

export enum Status {
	// Idle means we are ready to begin a new tx.
	IDLE = 1,
	// Initializing tx (persisting pre-open data in db).
	INITIALIZING,
	// Currently processing a tx (can only process one at a time).
	PROCESSING,
}

// BTC variants is 8 decimals.
const DECIMALS = 10 ** 8;
// Sett tokens are (mostly) 18 decimals.
const SETT_DECIMALS = 10 ** 18;
const MAX_BPS = 10000;
const UPDATE_INTERVAL_SECONDS = 30 * 1000; // 30 seconds

const defaultRetryOptions = {
	// delay defaults to 200 ms.
	// delay grows exponentially by factor each attempt.
	factor: 1.5,
	// delay grows up until max delay.
	maxDelay: 1000,
	// maxAttempts to make before giving up.
	maxAttempts: 3,
};

const defaultProps = {
	openGateway: null,
	history: [],
	nextNonce: 0,
	current: null,
	status: Status.IDLE,
	loading: false,
	done: null,
	error: null,

	badgerBurnFee: 0,
	badgerMintFee: 0,
	renvmBurnFee: 0,
	renvmMintFee: 0,
	lockNetworkFee: 0.001,
	releaseNetworkFee: 0.001,

	renbtcBalance: 0,
	wbtcBalance: 0,

	shortAddr: '',
};

class BridgeStore {
	private store!: RootStore;
	private network!: Network;
	private db!: firebase.firestore.Firestore;
	private gjs!: GatewayJS;
	private openGateway!: Gateway | null;
	private adapter!: Contract;

	private renbtc!: Contract;
	private wbtc!: Contract;
	private bwbtc!: Contract;
	private bCRVrenBTC!: Contract;
	private bCRVsBTC!: Contract;
	private bCRVtBTC!: Contract;

	private gateway!: Contract;
	// Update data like user balances on a timer.
	private updateTimer!: ReturnType<typeof setTimeout>;

	public badgerBurnFee!: number;
	public badgerMintFee!: number;
	public renvmBurnFee!: number;
	public renvmMintFee!: number;
	public lockNetworkFee!: number;
	public releaseNetworkFee!: number;

	public renbtcBalance!: number;
	public wbtcBalance!: number;
	public bwbtcBalance!: number;
	public bCRVrenBTCBalance!: number;
	public bCRVsBTCBalance!: number;
	public bCRVtBTCBalance!: number;

	public shortAddr!: string;

	public nextNonce!: number;
	// current holds current in process renvm tx.
	public current!: RenVMTransaction | null;
	// done is an optional callback to execute on completion.
	public done!: () => void | null;
	// Transaction history.
	public history!: RenVMTransaction[];
	/*
	 * Errors stop the UI from progressing until the underlying
	 * issue is resolved (e.g. can't talk to db). We don't need to stop
	 * all progress due to errors.
	 *
	 * Non blocking errors:
	 *   - updating an already persisted tx
	 *   - reopening an incomplete tx
	 *
	 * Blocking errors:
	 *   - fetching next nonce
	 *   - fetch/recover txes
	 *   - initializing tx (persisting pre-open tx data)
	 *   - commiting tx (persisting opened tx data)
	 */
	public error!: Error | null;
	public loading!: boolean;
	public status!: Status;

	constructor(store: RootStore) {
		if (!FLAGS.BRIDGE_FLAG) return;

		this.store = store;
		this.db = fbase.firestore();
		this.gjs = new GatewayJS('mainnet');
		this.network = this.store.wallet.network;

		extendObservable(this, {
			...defaultProps,
		});

		observe(this.store.wallet as WalletStore, 'network', ({ newValue, oldValue }: IValueDidChange<Network>) => {
			if (oldValue === newValue) return;
			this.network = newValue;
			this.reload();
		});

		observe(this.store.wallet as WalletStore, 'provider', ({ newValue }: IValueDidChange<provider>) => {
			if (!newValue) return;

			const web3 = new Web3(newValue);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.adapter = new web3.eth.Contract(BADGER_ADAPTER, bridge_system['adapter']);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.renbtc = new web3.eth.Contract(ERC20.abi as AbiItem[], tokens.renBTC);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.wbtc = new web3.eth.Contract(ERC20.abi as AbiItem[], tokens.wBTC);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.bwbtc = new web3.eth.Contract(ERC20.abi as AbiItem[], sett_system.vaults['yearn.wBtc']);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.bCRVrenBTC = new web3.eth.Contract(ERC20.abi as AbiItem[], sett_system.vaults['native.renCrv']);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.bCRVsBTC = new web3.eth.Contract(ERC20.abi as AbiItem[], sett_system.vaults['native.sbtcCrv']);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.bCRVtBTC = new web3.eth.Contract(ERC20.abi as AbiItem[], sett_system.vaults['native.tbtcCrv']);

			this.gateway = new web3.eth.Contract(BTC_GATEWAY, RENVM_GATEWAY_ADDRESS);
			Promise.all([this._getFees(), this._getBTCNetworkFees()]);
			return;
		});

		observe(
			this.store.wallet as WalletStore,
			'connectedAddress',
			({ newValue, oldValue }: IValueDidChange<string>) => {
				if (oldValue === newValue) return;
				// Set shortened addr.
				this.shortAddr = shortenAddress(newValue);
				this.reload();
			},
		);

		observe(
			this as BridgeStore,
			'current',
			/*
			 * The lifecycle of a tx is as follows:
			 *   - initialize a tx (persist gatewayJS params and nonce into db)
			 *   - open gjs and kick off renVM tx
			 *   - commit renVM tx data to db
			 *   - listen/perform updates via gjs
			 *
			 * On failure/restart, if the last tx is uncommitted or incomplete
			 * then it is set is `current` tx and we enter this lifecycle.
			 *
			 * Definitions for uncommitted/incomplete tx:
			 *   - uncommitted tx: did not persist renvm tx data yet
			 *   - incomplete tx: already persisted renvm tx data but tx has not been completed
			 */
			({ newValue, oldValue }: IValueDidChange<RenVMTransaction | null>) => {
				const { provider, connectedAddress } = this.store.wallet;
				if (!provider) return;
				if (_.isEqual(oldValue, newValue)) return;
				if (newValue === null) return;

				// Each lifecycle method updates the current tx after it finishes.
				// We handle all updates async here.

				if (this.status == Status.PROCESSING) {
					// No-op if tx processing not complete.
					if (!_isTxComplete(newValue)) return;

					// Execute any done cb if set.
					if (this.done) this.done();
					// Remove if completed.
					this.current = null;
					// TODO: This can be optimized to return from offset (currently fetches all).
					this._fetchTx(connectedAddress);
					this.status = Status.IDLE;
					return;
				}

				this.status = Status.INITIALIZING;
				// Check if needs init (new tx).
				if (newValue.created === undefined) {
					this._initTx(newValue);
					return;
				}

				this.status = Status.PROCESSING;
				// Check if uncommitted (open tx).
				if (!newValue.encodedTx) {
					this._openTx(newValue);
					return;
				}
				// Incomplete tx (recover tx).
				this._openTx(newValue, true);
			},
		);

		this.updateTimer = setTimeout(() => {
			// NB: Only ETH supported for now.
			if (this.network.name !== NETWORK_LIST.ETH) return;

			const { connectedAddress } = this.store.wallet;
			// So this doesn't race against address changes.
			if (this.loading) return;
			if (!connectedAddress) return;
			this._getBalances(connectedAddress);
		}, UPDATE_INTERVAL_SECONDS);
	}

	reload = action(() => {
		// Always reset first on reload even though we may not be loading any data.
		this.reset();

		const { queueNotification } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		// NB: Only ETH supported for now.
		if (this.network.name !== NETWORK_LIST.ETH) return;
		if (!provider) return;

		// Fetch old transactions and reload any incomplete tx.
		this.loading = true;
		Promise.all([this._fetchTx(connectedAddress), this._getBalances(connectedAddress)])
			.catch((err: Error) => {
				queueNotification(`Failed to fetch bridge data: ${err.message}`, 'error');
			})
			.finally(() => {
				this.loading = false;
			});
	});

	reset = action(() => {
		if (this.openGateway) {
			this.openGateway.close();
		}

		Object.entries(defaultProps).forEach(([k, v]) => {
			(this as any)[k] = v;
		});
	});

	// Begin a new tx.
	begin = action((newTx: RenVMTransaction, done: () => void) => {
		// Cannot concurrently execute tx.
		if (this.current) return;
		// NB: When we begin a new tx, only the gjs params are specified.
		this.current = newTx;
		this.done = done;
	});

	// Fetch tx history from db. There may be uncommitted/incomplete tx in here.
	_fetchTx = action(async (userAddr: string) => {
		try {
			await retry(async () => {
				// TODO: Implement paging of results if tx history
				// bloat starts to become a problem.
				const results = await this.db
					.collection('transactions')
					.where('user', '==', userAddr)
					.orderBy('nonce', 'desc')
					.get();

				const transactions: RenVMTransaction[] = [];
				results.forEach((doc) => {
					transactions.push({
						id: doc.id,
						...doc.data(),
					} as RenVMTransaction);
				});
				this.history = transactions;

				if (results.size > 0) {
					// Check if the first tx is uncommitted or incomplete and set current tx.
					const tx = transactions[0];
					if (!_isTxComplete(tx)) {
						this.current = tx;
					}

					// Nonce defaults to value of 0. If no results then assume
					// there are no transactions for the user.
					this.nextNonce = tx.nonce + 1;
				}
			}, defaultRetryOptions);
		} catch (err) {
			this.error = err;
		}
	});

	_initTx = action(async (tx: RenVMTransaction) => {
		const { queueNotification } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;

		try {
			const created = firebase.firestore.Timestamp.fromDate(new Date(Date.now()));
			const ref = this.db.collection('transactions').doc();
			// At this point we should only have are the tx params.
			const txData = {
				...tx,
				id: ref.id,
				// NB: Always store lowercase user addr.
				user: connectedAddress.toLowerCase(),
				nonce: this.nextNonce,
				created,
				deleted: false,
			};
			await retry(async () => {
				await ref.set(txData);
				// Update current tx.
				this.current = txData as RenVMTransaction;
				// Increment nonce.
				this.nextNonce++;
			}, defaultRetryOptions);
		} catch (err) {
			queueNotification(`Failed to initialize tx in db: ${err.message}`, 'error');
			this.error = err;
		}
	});

	_updateTx = action(async (tx: RenVMTransaction, deleted?: boolean, err?: Error) => {
		const { queueNotification } = this.store.uiState;

		try {
			const updated = firebase.firestore.Timestamp.fromDate(new Date(Date.now()));
			const ref = this.db.collection('transactions').doc(tx.id);
			const txData = {
				...tx,
				updated,
				error: err && err.message ? err.message : '',
				status: tx.status ? tx.status : '',
			};
			// Deletion is a soft delete.
			if (deleted) {
				txData.deleted = true;
			}
			await retry(async () => {
				await ref.update(txData);
				// Remove ref after committing to db.
				this.current = {
					...this.current,
					...txData,
				} as RenVMTransaction;
			}, defaultRetryOptions);
		} catch (err) {
			queueNotification(`Failed to update tx in db: ${err.message}`, 'error');
			this.error = err;
		}
	});

	_openTx = action(async (tx: RenVMTransaction, recover?: boolean) => {
		const { provider } = this.store.wallet;
		const { queueNotification } = this.store.uiState;

		// NB: Should not happen but just as a safety check.
		if (this.openGateway) {
			this.openGateway.close();
			this.openGateway = null;
		}

		try {
			if (recover) {
				const parsedTx = JSON.parse(tx.encodedTx);
				this.openGateway = this.gjs.recoverTransfer(provider, parsedTx, parsedTx.id).pause();
			} else {
				this.openGateway = this.gjs.open({
					...toJS(tx).params,
					web3Provider: provider,
				});
			}
			await this.openGateway
				.result()
				.on('status', async (status: LockAndMintStatus | BurnAndReleaseStatus) => {
					switch (status) {
						case LockAndMintStatus.ReturnedFromRenVM:
							queueNotification(
								'Deposit is ready, please sign the transaction to submit to ethereum',
								'info',
							);
							break;
						case LockAndMintStatus.ConfirmedOnEthereum:
							queueNotification('Mint is successful', 'success');
							break;
						case BurnAndReleaseStatus.ConfirmedOnEthereum:
							queueNotification('Release is completed', 'success');
							break;
					}
				})
				.on('transferUpdated', async (event: LockAndMintEvent | BurnAndReleaseEvent) => {
					if (event.archived) return;
					const txData = {
						...tx,
						encodedTx: JSON.stringify(event),
						status: event.status,
					};
					await this._updateTx(txData);
				})
				.catch((err: Error) => {
					if (err.message === 'Transfer cancelled by user') {
						this._updateTx(tx, true);
						queueNotification(`${err.message}.`, 'info');
						return;
					}

					this._updateTx(tx, true, err);
					queueNotification(`${err.message}.`, 'error');
				});
		} catch (err) {
			queueNotification(`Failed to open tx: ${err.message}`, 'error');
			// Blocking error if err on open/recover.
			this.error = err;
		}
	});

	_getFees = action(
		async (): Promise<void> => {
			const { queueNotification } = this.store.uiState;
			try {
				await retry(async () => {
					// NB: Only ETH supported for now. Check here since network could have
					// gotten set at any point from init to now and this fails loudly if
					// on the wrong network.
					if (this.network.name !== NETWORK_LIST.ETH) return;
					const [badgerBurnFee, badgerMintFee, renvmBurnFee, renvmMintFee] = (
						await Promise.all([
							this.adapter.methods.burnFeeBps().call(),
							this.adapter.methods.mintFeeBps().call(),
							this.gateway.methods.burnFee().call(),
							this.gateway.methods.mintFee().call(),
						])
					).map((result: number) => result / MAX_BPS);
					this.badgerMintFee = badgerMintFee;
					this.badgerBurnFee = badgerBurnFee;
					this.renvmBurnFee = renvmBurnFee;
					this.renvmMintFee = renvmMintFee;
				}, defaultRetryOptions);
			} catch (err) {
				queueNotification(`Failed to fetch fees: ${err.message}`, 'error');
			}
		},
	);

	_getBalances = action(async (userAddr: string) => {
		const { queueNotification } = this.store.uiState;
		try {
			await retry(async () => {
				// NB: Only ETH supported for now. Check here since network could have
				// gotten set at any point from init to now and this fails loudly if
				// on the wrong network.
				if (this.network.name !== NETWORK_LIST.ETH) return;
				const [
					renbtcBalance,
					wbtcBalance,
					bwbtcBalance,
					bCRVrenBTCBalance,
					bCRVsBTCBalance,
					bCRVtBTCBalance,
				] = await Promise.all([
					this.renbtc.methods.balanceOf(userAddr).call(),
					this.wbtc.methods.balanceOf(userAddr).call(),
					this.bwbtc.methods.balanceOf(userAddr).call(),
					this.bCRVrenBTC.methods.balanceOf(userAddr).call(),
					this.bCRVsBTC.methods.balanceOf(userAddr).call(),
					this.bCRVtBTC.methods.balanceOf(userAddr).call(),
				]);

				this.renbtcBalance = new BigNumber(renbtcBalance).dividedBy(DECIMALS).toNumber();
				this.wbtcBalance = new BigNumber(wbtcBalance).dividedBy(DECIMALS).toNumber();
				this.bwbtcBalance = new BigNumber(bwbtcBalance).dividedBy(DECIMALS).toNumber();
				this.bCRVrenBTCBalance = new BigNumber(bCRVrenBTCBalance).dividedBy(SETT_DECIMALS).toNumber();
				this.bCRVsBTCBalance = new BigNumber(bCRVsBTCBalance).dividedBy(SETT_DECIMALS).toNumber();
				this.bCRVtBTCBalance = new BigNumber(bCRVtBTCBalance).dividedBy(SETT_DECIMALS).toNumber();
			}, defaultRetryOptions);
		} catch (err) {
			queueNotification(`Failed to fetch fees: ${err.message}`, 'error');
		}
	});

	_getBTCNetworkFees = action(
		async (): Promise<void> => {
			const { queueNotification } = this.store.uiState;
			try {
				await retry(async () => {
					// NB: Query fees logic pulled from ren bridge source.
					// https://github.com/renproject/bridge/blob/18e5668db9423f2aaa32635c90dcf6269a3b1711/src/utils/walletUtils.ts#L104-L128
					const query = {
						jsonrpc: '2.0',
						method: 'ren_queryFees',
						id: 67,
						params: {},
					};

					const resp = await fetch('https://lightnode-mainnet.herokuapp.com/', {
						method: 'POST',
						body: JSON.stringify(query),
						headers: { 'Content-Type': 'application/json' },
					});
					const { result } = await resp.json();

					this.lockNetworkFee = new BigNumber(result.btc.lock).dividedBy(DECIMALS).toNumber();
					this.releaseNetworkFee = new BigNumber(result.btc.release).dividedBy(DECIMALS).toNumber();
				}, defaultRetryOptions);
			} catch (err) {
				queueNotification(`Failed to fetch BTC network fees: ${err.message}`, 'error');
			}
		},
	);
}

const _isTxComplete = function (tx: RenVMTransaction) {
	return (
		tx.status === LockAndMintStatus.ConfirmedOnEthereum ||
		tx.status === BurnAndReleaseStatus.ReturnedFromRenVM ||
		tx.deleted === true
	);
};

export default BridgeStore;
