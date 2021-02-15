import BigNumber from 'bignumber.js';
import { action, observe } from 'mobx';
import async from 'async';

import addresses from '../../config/bbtc/addresses.json';
import { TokenModel } from 'components/Bbtc/model';
import { RootStore } from '../store';

class BBTCStore {
	private store!: RootStore;
	private config!: typeof addresses.mainnet;
	private client!: any;

	public tokens: Array<TokenModel> = [];
	public bBTC: TokenModel;

	constructor(store: RootStore) {
		this.store = store;

		this.config = addresses.mainnet;
		const token_config = this.config.contracts.tokens;

		this.bBTC = new TokenModel(token_config.bBTC);
		this.tokens = [
			new TokenModel(token_config[`wBTC`]),
			new TokenModel(token_config[`renBTC`]),
			new TokenModel(token_config[`sBTC`]),
			new TokenModel(token_config[`bcrvwBTC`]),
			new TokenModel(token_config[`bcrvrenBTC`]),
		];

		observe(this.store.wallet as any, 'connectedAddress', () => {
			const { connectedAddress } = this.store.wallet;
			if (!connectedAddress) {
				this.initClient();
				this.fetchBalances();
			}
		});
		if (!!this.store.wallet.connectedAddress) {
			this.initClient();
			this.fetchBalances();
		}
	}

	initClient = action((): void => {
		console.log('Now fetching balances...');
	});
	fetchBalances = action((tokens: Array<TokenModel> = this.tokens): void => {
		// const { connectedAddress } = this.store.wallet;
		// TODO : fetchBalances using connectedAddress
		// TODO : fetchBalance of all tokens or passed tokens

		console.log('Now fetching balances...');
		// tokens.forEach((token) => {
		// token.balance = this.client.balance(token.address, connectedAddress);
		// });
	});

	getAllowance = action((underlyingAsset: TokenModel, spender: string, callback: (err: any, result: any) => void) => {
		const { connectedAddress } = this.store.wallet;

		this.client.getAllowance(connectedAddress, underlyingAsset.address, spender).then((result: any) => {
			callback(null, result);
		});
	});

	increaseAllowance = action(
		(underlyingAsset: TokenModel, spender: string, callback: (err: any, result: any) => void) => {
			const { queueNotification, setTxStatus } = this.store.uiState;
			const { connectedAddress } = this.store.wallet;

			queueNotification(`Sign the transaction to allow Badger to spend your ${underlyingAsset.symbol}`, 'info');
			this.client
				.allowance(spender, underlyingAsset.address, { from: connectedAddress })
				.on('transactionHash', (hash: string) => {
					queueNotification(`Transaction submitted.`, 'info', hash);
				})
				.on('receipt', () => {
					queueNotification(`${underlyingAsset.symbol} allowance increased.`, 'success');
					callback(null, {});
				})
				.catch((error: any) => {
					queueNotification(error.message, 'error');
					setTxStatus('error');
				});
		},
	);

	expectedMint = action((inToken: TokenModel, amount: BigNumber, outToken = this.bBTC) => {});

	mint = action((inToken: TokenModel, amount: BigNumber, outToken = this.bBTC) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;
		const spender = this.config.contracts.vesting;
		if (!connectedAddress) {
			return queueNotification('Please connect a wallet', 'error');
		}
		if (!amount || amount.isNaN() || amount.lte(0) || amount.gt(inToken.balance))
			return queueNotification('Please enter a valid amount', 'error');

		const methodSeries: any = [];

		async.parallel(
			[(callback: any) => this.getAllowance(inToken, spender, callback)],
			(err: any, allowances: any) => {
				// make sure we have allowance
				if (amount.gt(allowances[0]))
					methodSeries.push((callback: any) => this.increaseAllowance(inToken, spender, callback));
				methodSeries.push((callback: any) => this.client.mint(inToken.address, amount, callback));
				setTxStatus('pending');
				async.series(methodSeries, (err: any, results: any) => {
					console.log(err, results);
					setTxStatus(!!err ? 'error' : 'success');
				});
			},
		);
	});
}

export default BBTCStore;
