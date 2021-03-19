import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import { AbiItem } from 'web3-utils';
import { ERC20 } from 'config/constants';
import _merge from 'lodash/merge';
import _mergeWith from 'lodash/mergeWith';
import { getNftBatchInformation } from 'mobx/utils/api';
import mainnet from 'config/deployments/mainnet.json';
import { abi as scarcityPoolABI } from 'config/system/abis/BadgerScarcityPool.json';
import { abi as memeLtdABI } from 'config/system/abis/MemeLtd.json';
import { reduceNextGlobalRedemptionRate } from 'mobx/reducers/honeypotReducer';

export interface NFT {
	tokenId: string;
	balance: string;
	totalSupply: string;
	root: string;
	name?: string;
	image?: string;
}
export class HoneyPotStore {
	private store: RootStore;
	poolBalance?: BigNumber;
	nextRedemptionRate?: BigNumber;
	nfts?: NFT[];
	loadingPoolBalance = false;
	loadingNfts = false;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			poolBalance: this.poolBalance,
			loadingPoolBalance: this.loadingPoolBalance,
			loadingNfts: this.loadingNfts,
			nextRedemptionRate: this.nextRedemptionRate,
		});

		observe(this.store.wallet, 'connectedAddress', () => {
			this.fetchPoolBalance();
			this.fetchNFTS();
		});

		this.fetchPoolBalance();
		this.fetchNFTS();
	}

	fetchPoolBalance = action(async () => {
		try {
			const { provider, connectedAddress } = this.store.wallet;
			if (!connectedAddress) return;

			this.loadingPoolBalance = true;

			const web3 = new Web3(provider);
			const pool = new web3.eth.Contract(scarcityPoolABI as AbiItem[], mainnet.honeypotMeme);
			const bDiggAddress = await pool.methods.bdigg().call();
			const bDigg = new web3.eth.Contract(ERC20.abi as AbiItem[], bDiggAddress);
			const balance = await bDigg.methods.balanceOf(mainnet.honeypotMeme).call();
			this.poolBalance = new BigNumber(balance);
		} catch (error) {
			const message = error?.message || 'There was an error. Please try again later.';
			process.env.NODE_ENV != 'production' && this.store.uiState.queueNotification(message, 'error');
		} finally {
			this.loadingPoolBalance = false;
		}
	});

	// discus about whether to use the open sea api or not
	fetchNFTS = action(async () => {
		try {
			const { provider, connectedAddress } = this.store.wallet;
			if (!connectedAddress) return;

			this.loadingNfts = true;

			const nfts = [];
			const web3 = new Web3(provider);
			const pool = new web3.eth.Contract(scarcityPoolABI as AbiItem[], mainnet.honeypotMeme);
			const memeLtdAddress = await pool.methods.memeLtd().call();
			const memeLtd = new web3.eth.Contract(memeLtdABI as AbiItem[], memeLtdAddress);

			// given that we don't have the length of the nfts array in the contract we iterate until the contract fails
			for (let tokenIndex = 0; ; tokenIndex++) {
				try {
					const [tokenId, root] = await pool.methods.poolTokens(tokenIndex).call();
					const totalSupply = await memeLtd.methods.totalSupply(tokenId).call();
					nfts.push({ tokenId, root, totalSupply });
				} catch (e) {
					break;
				}
			}

			const [balances] = await Promise.all([
				memeLtd.methods
					.balanceOfBatch(
						Array(nfts.length).fill(connectedAddress),
						nfts.map(({ tokenId }) => tokenId),
					)
					.call(),
			]);

			this.nfts = _mergeWith(nfts, balances, (nfts, balance) => ({
				...nfts,
				balance,
			}));

			this.nextRedemptionRate = reduceNextGlobalRedemptionRate(this);
		} catch (error) {
			const message = error?.message || 'There was an error. Please try again later.';
			this.store.uiState.queueNotification(message, 'error');
			process.env.NODE_ENV != 'production' && console.error(error);
		} finally {
			this.loadingNfts = false;
		}
	});

	calculateRedemptionRate({ balance, totalSupply, root }: Pick<NFT, 'balance' | 'totalSupply' | 'root'>): BigNumber {
		if (!this.poolBalance) return new BigNumber('0');

		const owned = new BigNumber(balance);
		const total = new BigNumber(totalSupply);
		const exponential = new BigNumber(root);

		return this.poolBalance.multipliedBy(owned.dividedBy(total).exponentiatedBy(exponential));
	}
}
