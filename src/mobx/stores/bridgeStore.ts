import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import BigNumber from 'bignumber.js';
import { AbiItem } from 'web3-utils';
import { Bitcoin, Ethereum } from '@renproject/chains';
import RenJS from '@renproject/ren';
import { EthArg, LockAndMintStatus, BurnAndReleaseStatus } from '@renproject/interfaces';
import { extendObservable, action, observe, IValueDidChange, toJS } from 'mobx';
import { retry } from '@lifeomic/attempt';
import { RootStore } from '../RootStore';
import {
	defaultRetryOptions,
	// abis
	ERC20,
	RENVM_GATEWAY_ADDRESS,
} from 'config/constants';
import { BADGER_ADAPTER } from 'config/system/abis/BadgerAdapter';
import { BTC_GATEWAY } from 'config/system/abis/BtcGateway';
import { bridge_system, tokens, sett_system, defi_dollar } from 'config/deployments/mainnet.json';
import { shortenAddress } from 'utils/componentHelpers';
import { isEqual } from '../../utils/lodashToNative';
import { RenVMTransaction } from '../model/bridge/renVMTransaction';
import { defaultNetwork } from 'config/networks.config';
import { REN_FEES_ENDPOINT } from '../../config/constants';
import { Network } from '@badger-dao/sdk';
import storage from '../../utils/storage';

//testing
import { abi } from 'config/system/abis/ZapPeak.json';
import coreConfig from 'config/system/abis/BadgerBtcPeakCore.json';

export enum Status {
	// Idle means we are ready to begin a new tx.
	IDLE = 1,
	// Initializing tx (persisting pre-open data in localstorage).
	INITIALIZING,
	// Currently processing a tx (can only process one at a time).
	PROCESSING,
}

const PERSISTED_TXN: string = 'PERSISTED_TXN';

// BTC variants is 8 decimals.
const DECIMALS = 10 ** 8;
// Vault tokens are (mostly) 18 decimals.
const SETT_DECIMALS = 10 ** 18;
const MAX_BPS = 10000;
const UPDATE_INTERVAL_SECONDS = 30 * 1000; // 30 seconds

const defaultProps = {
	history: [],
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

const supportedBridgeNetworks: string[] = [Network.Ethereum];

class BridgeStore {
	private store!: RootStore;
	private network!: string | undefined;
	private renJS: RenJS;
	private adapter!: Contract;
	private zapPeak!: Contract;
	private badgerPeak!: Contract;
	private byvWbtcPeak!: Contract;
	private core!: Contract;

	private renbtc!: Contract;
	private wbtc!: Contract;
	private byvwbtc!: Contract;
	private bCRVrenBTC!: Contract;
	private bCRVsBTC!: Contract;
	private bCRVtBTC!: Contract;

	private gateway!: Contract;
	// Update data like account balances on a timer.
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

	// current holds current in process renvm tx.
	public current!: RenVMTransaction | null;
	// done is an optional callback to execute on completion.
	public done!: () => void | null;
	// Transaction history.
	// disabled for new lint - out of scope
	/* eslint-disable-next-line no-restricted-globals */
	public history!: RenVMTransaction[];
	/*
	 * Errors stop the UI from progressing until the underlying
	 * issue is resolved. We don't need to stop
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
	// disabled for new lint - out of scope
	/* eslint-disable-next-line no-restricted-globals */
	public error!: Error | null;
	public loading!: boolean;
	// disabled for new lint - out of scope
	/* eslint-disable-next-line no-restricted-globals */
	public status!: Status;

	constructor(store: RootStore) {
		this.store = store;
		this.renJS = new RenJS('mainnet');
		// NB: At construction time, the value of wallet provider is unset so we cannot fetch network
		// from provider. Align network init logic w/ how it works in the walletStore.
		const network = defaultNetwork;
		this.network = network ? network.symbol : '';

		extendObservable(this, {
			...defaultProps,
		});

		observe(
			this as BridgeStore,
			'current',
			/*
			 * The lifecycle of a tx is as follows:
			 *   - initialize a tx (persist gatewayJS params and nonce into localstorage)
			 *   - open renjs and kick off renVM tx
			 *   - commit renVM tx data
			 *   - listen/perform updates via renjs
			 *
			 * On failure/restart, if the last tx is uncommitted or incomplete
			 * then it is set is `current` tx and we enter this lifecycle.
			 *
			 * Definitions for uncommitted/incomplete tx:
			 *   - uncommitted tx: did not persist renvm tx data yet
			 *   - incomplete tx: already persisted renvm tx data but tx has not been completed
			 */
			({ newValue, oldValue }: IValueDidChange<RenVMTransaction | null>) => {
				const { provider } = this.store.onboard;
				if (!provider) {
					return;
				}
				// TODO: Remove this last lodash reference
				if (isEqual(oldValue, newValue)) return;
				if (newValue === null) return;

				// Each lifecycle method updates the current tx after it finishes.
				// We handle all updates async here.

				if (this.status === Status.PROCESSING) {
					// No-op if tx processing not complete.
					if (!_isTxComplete(newValue as RenVMTransaction)) return;
					this.complete();
					return;
				}

				this.status = Status.INITIALIZING;
				// Check if needs init (new tx).
				if ((newValue as RenVMTransaction).created === undefined) {
					this.initTx(newValue as RenVMTransaction);
					return;
				}

				this.status = Status.PROCESSING;
				this.openTx(newValue as RenVMTransaction);
			},
		);

		this.updateTimer = setTimeout(() => {
			// NB: Only ETH supported for now.
			if (this.network !== Network.Ethereum) return;

			const { address } = this.store.onboard;
			// So this doesn't race against address changes.
			if (this.loading) return;
			if (!address) return;
			this._getBalances(address);
		}, UPDATE_INTERVAL_SECONDS);
	}

	isBridgeSupported = action((): boolean => {
		if (!this.store.onboard.onSupportedNetwork) {
			return false;
		}
		return supportedBridgeNetworks.includes(this.store.network.network?.symbol);
	});

	reload = action(async () => {
		// Always reset first on reload even though we may not be loading any data.
		this.reset();
		this.updateContracts();

		const { queueNotification } = this.store.uiState;
		const { wallet, address } = this.store.onboard;

		if (!wallet || !address) return;

		this.loading = true;
		await Promise.all([
			// Fetch old transactions and reload any incomplete tx.
			this._getBalances(address),
			this._getFees(),
			this._getRenFees(),
			this._getBTCNetworkFees(),
		])
			.catch((err: Error) => {
				console.error(err);
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
		// NB: When we begin a new tx, only the renjs params are specified.
		this.current = newTx;
		this.done = done;
	});

	updateContracts = action(() => {
		const web3 = new Web3(this.store.onboard.wallet?.provider);
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
	});

	getPersistedTxn = action((): RenVMTransaction | null => {
		const txnString: string = storage.getItem(PERSISTED_TXN);
		if (!txnString) return null;
		return JSON.parse(txnString);
	});

	_updatePersistedTxn = (txn: RenVMTransaction): void => {
		if (!txn?.renVMStatus) return;
		const txnString: string = txn.encodedTx ?? JSON.stringify(txn);
		storage.setItem(PERSISTED_TXN, txnString);
	};

	_clearPersistedTxn = (): void => {
		storage.removeItem(PERSISTED_TXN);
	};

	// Complete tx processing.
	_complete = (): void => {
		this._clearPersistedTxn();
		const { address } = this.store.onboard;
		if (!address) return;
		// Execute any done cb if set.
		if (this.done) this.done();
		// Remove if completed.
		this.current = null;
		this.status = Status.IDLE;
	};

	complete = action(this._complete);

	initTx = action(async (tx: RenVMTransaction) => {
		const { queueNotification } = this.store.uiState;
		const { address } = this.store.onboard;

		if (!address) {
			return;
		}

		try {
			const created = Date.now();
			// At this point we should only have are the tx params.
			const txData = {
				...tx,
				// NB: Always store lowercase account addr.
				user: address.toLowerCase(),
				nonce: JSON.stringify(RenJS.utils.randomNonce()),
				created,
				deleted: false,
			};
			this.current = txData as RenVMTransaction;
		} catch (err) {
			console.error(err);
			queueNotification(`Failed to initialize tx: ${err.message}`, 'error');
			this.error = err;
		}
	});

	cancelTx = (): void => {
		if (this.current !== null) {
			this._updateTx(this.current, true);
		}
	};

	_updateTx = action(async (tx: RenVMTransaction, deleted?: boolean, err?: Error) => {
		const { queueNotification } = this.store.uiState;

		try {
			const updated = Date.now();
			const txData = {
				...tx,
				updated,
				error: err && err.message ? err.message : '',
				status: tx.status ? tx.status : '',
				// Just enough params from the transaction to be able to recover
				encodedTx: JSON.stringify(
					(({
						user,
						params,
						txHash,
						status,
						renVMStatus,
						renVMMessage,
						mintChainHash,
						id,
						nonce,
					}: RenVMTransaction) => ({
						user,
						params,
						txHash,
						status,
						renVMStatus,
						renVMMessage,
						mintChainHash,
						id,
						nonce,
					}))(tx),
				),
			};
			// Deletion is a soft delete.
			if (deleted) {
				txData.deleted = true;
			}
			this._updatePersistedTxn(txData);
			if (this.status === Status.IDLE) return;
			this.current = {
				...this.current,
				...txData,
			} as RenVMTransaction;
		} catch (err) {
			console.error(err);
			queueNotification(`Failed to update tx: ${err.message}`, 'error');
			this.error = err;
		}
	});

	openTx = action(async (tx: RenVMTransaction) => {
		const { queueNotification } = this.store.uiState;

		try {
			const parsedTx = tx.encodedTx ? JSON.parse(tx.encodedTx) : toJS(tx);
			const web3 = (window as any).web3;
			if (parsedTx.params.contractFn === 'mint') {
				checkUserAddrInvariantAndThrow(parsedTx);
				const mint = await this.renJS.lockAndMint({
					asset: parsedTx.params.asset,
					from: Bitcoin(),
					nonce: Buffer.from(JSON.parse(parsedTx.nonce)),
					to: Ethereum(web3.currentProvider).Contract({
						sendTo: parsedTx.params.sendTo,
						contractFn: parsedTx.params.contractFn,
						contractParams: parsedTx.params.contractParams,
					}),
				});
				await this._updateTx({
					...parsedTx,
					mintGateway: mint.gatewayAddress,
				});

				await mint.on('deposit', async (deposit) => {
					// Details of the deposit are available from `deposit.depositDetails`.

					const hash = deposit.txHash();
					const depositLog = (msg: string) => {
						console.log(`[${hash.slice(0, 8)}][${deposit.status}] ${msg}`);
						return this._updateTx({ ...parsedTx, renVMStatus: deposit.status, renVMMessage: msg });
					};

					try {
						await deposit
							.confirmed()
							.on('target', (target) => depositLog(`Waiting for ${target} confirmations.`))
							.on('confirmation', (confs, target) => depositLog(`${confs}/${target} confirmations.`));

						await deposit.signed();

						await deposit
							.mint()
							// Print Ethereum transaction hash.
							.on('transactionHash', (txHash) => depositLog(`Mint tx: ${txHash}`));

						await this._updateTx({ ...parsedTx, renVMStatus: deposit.status }, true);
					} catch (e) {
						console.error(e);
						await this._updateTx(parsedTx, true, e);
						queueNotification(`Failed to complete transaction: ${e.message}`, 'error');
					} finally {
						this._complete();
					}
				});
			} else if (parsedTx.params.contractFn === 'burn') {
				const toAddress = parsedTx.params.contractParams.find((p: EthArg) => p.name === '_to').value;
				const burnAndRelease = await this.renJS.burnAndRelease({
					asset: parsedTx.params.asset,
					to: Bitcoin().Address(toAddress),
					from: Ethereum(web3.currentProvider).Contract({
						sendTo: parsedTx.params.sendTo,
						contractFn: parsedTx.params.contractFn,
						contractParams: parsedTx.params.contractParams,
					}),
					// When recovering, this will be set
					txHash: parsedTx.txHash,
					// or this will be set
					transaction: parsedTx.mintChainHash,
				});

				try {
					await burnAndRelease.burn().on('transactionHash', (txHash) =>
						this._updateTx({
							...parsedTx,
							renVMStatus: burnAndRelease.status,
							mintChainHash: txHash,
						}),
					);

					await burnAndRelease
						.release()
						// Store RenVM transaction hash for recovery
						.on('txHash', (txHash: string) =>
							this._updateTx({
								...parsedTx,
								txHash,
								renVMStatus: burnAndRelease.status,
							}),
						);
					await this._updateTx({ ...parsedTx, renVMStatus: burnAndRelease.status }, true);
				} catch (e) {
					console.error(e);
					await this._updateTx(parsedTx, true, e);
					queueNotification(`Failed to complete transaction: ${e.message}`, 'error');
				} finally {
					this._complete();
				}
			} else {
				throw new Error('Unknown contract function: ' + parsedTx.params.contractFn);
			}
		} catch (err) {
			console.error(err);
			this._clearPersistedTxn();
			queueNotification(`Failed to open tx: ${err.message}`, 'error');
			// Blocking error if err on open/recover.
			this.error = err;
		}
	});

	resumeTx = action(async (tx: RenVMTransaction) => {
		this.status = Status.INITIALIZING;
		this.current = tx;
		await this.openTx(tx);
	});

	_getFees = async (): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		try {
			await retry(async () => {
				const [badgerBurnFee, badgerMintFee] = (
					await Promise.all([
						this.adapter.methods.burnFeeBps().call(),
						this.adapter.methods.mintFeeBps().call(),
					])
				).map((result: number) => result / MAX_BPS);
				this.badgerMintFee = badgerMintFee;
				this.badgerBurnFee = badgerBurnFee;
			}, defaultRetryOptions);
		} catch (err) {
			console.error(err);
			queueNotification(`Failed to fetch fees: ${err.message}`, 'error');
		}
	};

	_saveRenFees = (burnFee: number, mintFee: number): void => {
		this.renvmMintFee = mintFee;
		this.renvmBurnFee = burnFee;
	};

	_getRenFees = async (): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		fetch(REN_FEES_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({ method: 'ren_queryBlockState', id: 1, jsonrpc: '2.0', params: {} }),
		})
			.then((res: { json: () => Promise<Response> }) => res.json())
			.then((json: any) =>
				this._saveRenFees(
					json.result.state.v.BTC.fees.chains[3].burnFee / MAX_BPS,
					json.result.state.v.BTC.fees.chains[3].mintFee / MAX_BPS,
				),
			)
			.catch((err: Error) => {
				queueNotification(`Failed to fetch RenVM Fees: ${err.message}`, 'error');
				console.error(err);
			});
	};

	_getBalances = async (userAddr: string): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		try {
			await retry(async () => {
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
			console.error(err);
			queueNotification(`Failed to fetch fees: ${err.message}`, 'error');
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
			console.error(err);
			queueNotification(`Failed to fetch BTC network fees: ${err.message}`, 'error');
		}
	};

	calcIbbtcFees = async (amount: number, mintBool: boolean): Promise<number> => {
		const { queueNotification } = this.store.uiState;
		let fee = 0;
		try {
			await retry(async () => {
				if (mintBool === true) {
					const mintFee = await this.core.methods.mintFee().call();
					fee = (amount * mintFee) / 10000;
				} else {
					const redeemFee = await this.core.methods.redeemFee().call();
					const pricePerShare = await this.core.methods.pricePerShare().call();
					fee = (amount * pricePerShare * redeemFee) / 1e22;
				}
			}, defaultRetryOptions);
		} catch (err) {
			queueNotification(`Failed to fetch ibBTC fees: ${err.message}`, 'error');
			console.error(err);
		}
		return fee;
	};

	calcMintOrRedeemPath = async (amount: BigNumber, mintOrRedeem: boolean): Promise<any[]> => {
		const { queueNotification } = this.store.uiState;
		let poolId = undefined;
		let tokenAmount = 0;
		let optimalToken = undefined;
		try {
			await retry(async () => {
				if (mintOrRedeem) {
					//mint
					const optimalPathRenbtc = await this.zapPeak.methods.calcMint(tokens.renBTC, amount).call();
					const optimalPathWbtc = await this.zapPeak.methods.calcMint(tokens.wBTC, amount).call();
					const ibbtcAmountRenbtc = optimalPathRenbtc['bBTC'];
					const ibbtcAmountWbtc = optimalPathWbtc['bBTC'];
					//pick wbtc or renbtc based on return values
					if (ibbtcAmountRenbtc > ibbtcAmountWbtc) {
						poolId = parseInt(optimalPathRenbtc['poolId']);
						tokenAmount = ibbtcAmountRenbtc;
						optimalToken = tokens.renBTC;
					} else {
						poolId = parseInt(optimalPathWbtc['poolId']);
						tokenAmount = ibbtcAmountWbtc;
						optimalToken = tokens.wBTC;
					}
				} else {
					//burn
					const optimalPathRenbtc = await this.zapPeak.methods.calcRedeem(tokens.renBTC, amount).call();
					const optimalPathWbtc = await this.zapPeak.methods.calcRedeem(tokens.wBTC, amount).call();
					const renbtcAmount = optimalPathRenbtc['bBTC'];
					const wbtcAmount = optimalPathWbtc['bBTC'];
					if (renbtcAmount > wbtcAmount) {
						poolId = optimalPathRenbtc['poolId'];
						tokenAmount = renbtcAmount;
						optimalToken = tokens.renBTC;
					} else {
						poolId = optimalPathWbtc['poolId'];
						tokenAmount = wbtcAmount;
						optimalToken = tokens.wBTC;
					}
				}
			}, defaultRetryOptions);
		} catch (err) {
			queueNotification(`Failed to fetch optimal PoolID: ${err.message}`, 'error');
			console.error(err.message);
		}
		return [poolId, new BigNumber(tokenAmount).dividedBy(SETT_DECIMALS).toString(), optimalToken];
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
	if (user?.value.toLowerCase() !== tx.user) {
		throw `Mint destination (${user?.value}) does not match connected address (${tx.user})`;
	}
};

export default BridgeStore;
