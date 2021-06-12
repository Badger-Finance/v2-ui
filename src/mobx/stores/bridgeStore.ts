import firebase from 'firebase';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import BigNumber from 'bignumber.js';
import { provider } from 'web3-core';
import { AbiItem } from 'web3-utils';
import RenJS from '@renproject/ren';
import { LockAndMintDeposit } from '@renproject/ren/build/main';
import {
	LockAndMintStatus,
	LockAndMintParams,
	BurnAndReleaseStatus,
	BurnAndReleaseParams,
} from '@renproject/interfaces';
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
} from 'config/constants';
import { BADGER_ADAPTER } from 'config/system/abis/BadgerAdapter';
import { BTC_GATEWAY } from 'config/system/abis/BtcGateway';
import { bridge_system, tokens, sett_system } from 'config/deployments/mainnet.json';
import { shortenAddress } from 'utils/componentHelpers';
import { isEqual } from '../../utils/lodashToNative';
import { getNetworkFromProvider } from 'mobx/utils/helpers';

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
	history: [],
	nextNonce: 0,
	current: null,
	status: Status.IDLE,
	loading: false,
	done: null,
	error: null,
	network: undefined,

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
	private network!: string | undefined;
	private db!: firebase.firestore.Firestore;
	private gjs!: RenJS;
	private adapter!: Contract;

	private renbtc!: Contract;
	private wbtc!: Contract;
	private byvwbtc!: Contract;
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
	public byvwbtcBalance!: number;
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
		this.store = store;
		this.db = fbase.firestore();
		const network = 'testnet'; // null out for prod
		this.gjs = new RenJS(network);
		// M50: by default the network ID is set to ethereum.  We should check the provider to ensure the
		// connected wallet is using ETH network, not the site.
		this.network = getNetworkFromProvider(this.store.wallet.provider);

		extendObservable(this, {
			...defaultProps,
		});

		observe(this.store.wallet as WalletStore, 'network', ({ newValue, oldValue }: IValueDidChange<Network>) => {
			if (oldValue && oldValue === newValue) return;
			this.network = newValue.name;
			this.reload();
		});

		observe(this.store.wallet as WalletStore, 'provider', ({ newValue }: IValueDidChange<provider>) => {
			if (!newValue) return;

			const web3 = new Web3(newValue);
			// We're disabling these because the web3-eth-contract package has not been updated to
			// be compatible with the updated web3 package
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
			this.byvwbtc = new web3.eth.Contract(ERC20.abi as AbiItem[], sett_system.vaults['yearn.wBtc']);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.bCRVrenBTC = new web3.eth.Contract(ERC20.abi as AbiItem[], sett_system.vaults['native.renCrv']);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.bCRVsBTC = new web3.eth.Contract(ERC20.abi as AbiItem[], sett_system.vaults['native.sbtcCrv']);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.bCRVtBTC = new web3.eth.Contract(ERC20.abi as AbiItem[], sett_system.vaults['native.tbtcCrv']);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.gateway = new web3.eth.Contract(BTC_GATEWAY, RENVM_GATEWAY_ADDRESS);
			return;
		});

		observe(
			this.store.wallet as WalletStore,
			'connectedAddress',
			({ newValue, oldValue }: IValueDidChange<string>) => {
				if (oldValue === newValue) return;
				// Set shortened addr.
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
				const { provider } = this.store.wallet;
				if (!provider) return;
				// TODO: Remove this last lodash reference
				if (isEqual(oldValue, newValue)) return;
				if (newValue === null) return;

				// Each lifecycle method updates the current tx after it finishes.
				// We handle all updates async here.

				if (this.status == Status.PROCESSING) {
					// No-op if tx processing not complete.
					if (!_isTxComplete(newValue)) return;
					this.complete();
					return;
				}

				this.status = Status.INITIALIZING;
				// Check if needs init (new tx).
				if (newValue.created === undefined) {
					this.initTx(newValue);
					return;
				}

				this.status = Status.PROCESSING;
				// Check if uncommitted (open tx).
				if (!newValue.encodedTx) {
					this.openTx(newValue);
					return;
				}
				// Incomplete tx (recover tx).
				this.openTx(newValue, true);
			},
		);

		this.updateTimer = setTimeout(() => {
			// NB: Only ETH supported for now.
			if (this.network !== NETWORK_LIST.ETH) return;

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
		if (this.network !== NETWORK_LIST.ETH) return;
		if (!provider) return;

		this.shortAddr = shortenAddress(connectedAddress);

		this.loading = true;
		Promise.all([
			// Fetch old transactions and reload any incomplete tx.
			this._fetchTx(connectedAddress),
			this._getBalances(connectedAddress),
			this._getFees(),
			this._getBTCNetworkFees(),
		])
			.catch((err: Error) => {
				queueNotification(`Failed to fetch bridge data: ${err.message}`, 'error');
			})
			.finally(() => {
				this.loading = false;
			});
	});

	reset = action(() => {
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

	// Complete tx processing.
	_complete = (): void => {
		const { connectedAddress } = this.store.wallet;
		// Execute any done cb if set.
		if (this.done) this.done();
		// Remove if completed.
		this.current = null;
		// TODO: This can be optimized to return from offset (currently fetches all).
		this.fetchTx(connectedAddress);
		this.status = Status.IDLE;
	};

	complete = action(this._complete);

	_fetchTx = async (userAddr: string): Promise<void> => {
		try {
			await retry(async () => {
				// TODO: Implement paging of results if tx history
				// bloat starts to become a problem.
				const results = await this.db
					.collection('transactions')
					.where('user', '==', userAddr.toLowerCase())
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
	};

	// Fetch tx history from db. There may be uncommitted/incomplete tx in here.
	fetchTx = action(this._fetchTx);

	initTx = action(async (tx: RenVMTransaction) => {
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
				// TODO: Can remove this after we remove duplicate listeners (due to switching networks/addrs).
				// We avoid setting current tx if we're already in IDLE state since completion/update can
				// be racy, esp if we have duplicate listeners.
				if (this.status == Status.IDLE) return;
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

	openTx = action(async (tx: RenVMTransaction, recover?: boolean) => {
		const { provider } = this.store.wallet;
		const { queueNotification } = this.store.uiState;

		try {
			const parsedTx = toJS(tx);
			await window.ethereum.enable();
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			provider.getSigner();
			const signer = provider.getSigner();
			const address = await signer.getAddress();

			if (parsedTx.contractFn === 'mint') {
				checkUserAddrInvariantAndThrow(parsedTx);
				const lockAndMint = await this.gjs.lockAndMint(parsedTx.params as LockAndMintParams);

				// TODO: fix lockandmintdeposit import
				lockAndMint.on('deposit', async (deposit: LockAndMintDeposit) => {
					// TODO: sync these to state
					await deposit
						.confirmed()
						.on('target', (confs, target) => console.log(`${confs}/${target} confirmations`))
						.on('confirmation', (confs, target) => console.log(`${confs}/${target} confirmations`));

					await deposit.signed().on('status', (status) => console.log(`Status: ${status}`));

					await deposit.mint().on('transactionHash', (txHash) => console.log(`Mint tx: ${txHash}`));
				});
			} else if (parsedTx.contractFn === 'burn') {
				const burnAndRelease = await this.gjs.burnAndRelease(parsedTx.params as BurnAndReleaseParams);

				let confirmations = 0;
				await burnAndRelease
					.burn()
					// Ethereum transaction confirmations.
					.on('confirmation', (confs) => {
						confirmations = confs;
					})
					// Print Ethereum transaction hash.
					.on('transactionHash', (txHash) => console.log(`txHash: ${String(txHash)}`));

				await burnAndRelease
					.release()
					// Print RenVM status - "pending", "confirming" or "done".
					.on('status', (status) =>
						status === 'confirming' ? console.log(`${status} (${confirmations}/15)`) : console.log(status),
					)
					// Print RenVM transaction hash
					.on('txHash', console.log);
			}
		} catch (err) {
			queueNotification(`Failed to open tx: ${err.message}`, 'error');
			// Blocking error if err on open/recover.
			this.error = err;
		}
	});

	_getFees = async (): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		try {
			await retry(async () => {
				// NB: Only ETH supported for now. Check here since network could have
				// gotten set at any point from init to now and this fails loudly if
				// on the wrong network.
				if (this.network !== NETWORK_LIST.ETH) return;
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
			console.log(err.message);
		}
	};

	_getBalances = async (userAddr: string): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		try {
			await retry(async () => {
				// NB: Only ETH supported for now. Check here since network could have
				// gotten set at any point from init to now and this fails loudly if
				// on the wrong network.
				if (this.network !== NETWORK_LIST.ETH) return;
				const [
					renbtcBalance,
					wbtcBalance,
					byvwbtcBalance,
					bCRVrenBTCBalance,
					bCRVsBTCBalance,
					bCRVtBTCBalance,
				] = await Promise.all([
					this.renbtc.methods.balanceOf(userAddr).call(),
					this.wbtc.methods.balanceOf(userAddr).call(),
					this.byvwbtc.methods.balanceOf(userAddr).call(),
					this.bCRVrenBTC.methods.balanceOf(userAddr).call(),
					this.bCRVsBTC.methods.balanceOf(userAddr).call(),
					this.bCRVtBTC.methods.balanceOf(userAddr).call(),
				]);

				this.renbtcBalance = new BigNumber(renbtcBalance).dividedBy(DECIMALS).toNumber();
				this.wbtcBalance = new BigNumber(wbtcBalance).dividedBy(DECIMALS).toNumber();
				this.byvwbtcBalance = new BigNumber(byvwbtcBalance).dividedBy(DECIMALS).toNumber();
				this.bCRVrenBTCBalance = new BigNumber(bCRVrenBTCBalance).dividedBy(SETT_DECIMALS).toNumber();
				this.bCRVsBTCBalance = new BigNumber(bCRVsBTCBalance).dividedBy(SETT_DECIMALS).toNumber();
				this.bCRVtBTCBalance = new BigNumber(bCRVtBTCBalance).dividedBy(SETT_DECIMALS).toNumber();
			}, defaultRetryOptions);
		} catch (err) {
			queueNotification(`Failed to fetch fees: ${err.message}`, 'error');
			console.log(err.message);
		}
	};

	_getBTCNetworkFees = async (): Promise<void> => {
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
	};
}

const _isTxComplete = function (tx: RenVMTransaction) {
	return (
		tx.status === LockAndMintStatus.ConfirmedOnEthereum ||
		tx.status === BurnAndReleaseStatus.ReturnedFromRenVM ||
		tx.deleted === true
	);
};

// Invariant check on matching _user address w/ connectedAddress of the tx.
const checkUserAddrInvariantAndThrow = (tx: RenVMTransaction) => {
	if (tx.params.contractFn !== 'mint') return;

	const user = tx.params.contractParams?.find(({ name }) => name === '_user');
	if (user?.value !== tx.user) {
		throw `Mint destination (${user}) does not match connected address (${tx.user})`;
	}
};

export default BridgeStore;
