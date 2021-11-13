import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../RootStore';
import { AbiItem } from 'web3-utils';
import { ERC20, NETWORK_IDS } from 'config/constants';
import mainnet from 'config/deployments/mainnet.json';
import { abi as scarcityPoolABI } from 'config/system/abis/BadgerScarcityPool.json';
import { abi as memeLtdABI } from 'config/system/abis/MemeLtd.json';
import { getSendOptions, sendContractMethod } from 'mobx/utils/web3';
import { NFT } from '../model/boost/NFT';

const nftAssetsByTokenId: Record<string, Pick<NFT, 'name' | 'image' | 'redirectUrl' | 'totalSupply'>> = {
	'205': {
		name: 'Wack-A-Badger',
		image: 'https://images.dontbuymeme.com/collections/badger/mp4/wack-a-badger.mp4',
		redirectUrl: 'https://opensea.io/assets/0xe4605d46Fd0B3f8329d936a8b258D69276cBa264/205',
		totalSupply: '200',
	},
	'206': {
		name: 'Badgerpack Joyride',
		image: 'https://images.dontbuymeme.com/collections/badger/mp4/badgerpack-joyride.mp4',
		redirectUrl: 'https://opensea.io/assets/0xe4605d46Fd0B3f8329d936a8b258D69276cBa264/206',
		totalSupply: '50',
	},
	'208': {
		name: 'Battle Badger',
		image: 'https://images.dontbuymeme.com/collections/badger/mp4/battle-badger.mp4',
		redirectUrl: 'https://opensea.io/assets/0xe4605d46Fd0B3f8329d936a8b258D69276cBa264/208',
		totalSupply: '10',
	},
};

export class HoneyPotStore {
	private store: RootStore;
	poolBalance?: BigNumber;
	nfts?: NFT[];
	nftBeingRedeemed: string[] = [];
	loadingPoolBalance = false;
	loadingNfts = false;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			poolBalance: this.poolBalance,
			loadingPoolBalance: this.loadingPoolBalance,
			loadingNfts: this.loadingNfts,
			nftBeingRedeemed: this.nftBeingRedeemed,
		});
	}

	refresh = action(async () => Promise.all([this.fetchNFTS(), this.fetchPoolBalance()]));

	fetchPoolBalance = action(async () => {
		try {
			const { network } = this.store.network;
			const { address, wallet } = this.store.onboard;
			if (!address || !wallet || network.id !== NETWORK_IDS.ETH) return;

			this.loadingPoolBalance = true;

			const web3 = new Web3(wallet.provider);
			const pool = new web3.eth.Contract(scarcityPoolABI as AbiItem[], mainnet.honeypotMeme);
			const bDiggAddress = await pool.methods.bdigg().call();
			const bDigg = new web3.eth.Contract(ERC20.abi as AbiItem[], bDiggAddress);
			const balance = await bDigg.methods.balanceOf(mainnet.honeypotMeme).call();
			this.poolBalance = new BigNumber(balance);
		} catch (error) {
			const message = error?.message || 'There was an error. Please try again later.';
			process.env.REACT_APP_BUILD_ENV !== 'production' && this.store.uiState.queueNotification(message, 'error');
		} finally {
			this.loadingPoolBalance = false;
		}
	});

	fetchNFTS = action(async () => {
		try {
			const { network } = this.store.network;
			const { address, wallet } = this.store.onboard;
			if (!address || !wallet || network.id !== NETWORK_IDS.ETH) return;

			this.loadingNfts = true;

			this.nftBeingRedeemed = [];
			const nfts = [];
			const web3 = new Web3(wallet.provider);
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

			const tokenIds = nfts.map(({ tokenId }) => tokenId);
			const [balances, poolBalances] = await Promise.all([
				memeLtd.methods.balanceOfBatch(Array(nfts.length).fill(address), tokenIds).call(),
				memeLtd.methods.balanceOfBatch(Array(nfts.length).fill(mainnet.honeypotMeme), tokenIds).call(),
			]);

			// merge nft core information, balance, name and image
			this.nfts = nfts.map((nft, index) => ({
				...nft,
				balance: balances[index],
				poolBalance: poolBalances[index],
				totalSupply: nftAssetsByTokenId[nft.tokenId].totalSupply,
				image: nftAssetsByTokenId[nft.tokenId].image,
				name: nftAssetsByTokenId[nft.tokenId].name,
				redirectUrl: nftAssetsByTokenId[nft.tokenId].redirectUrl,
			}));
		} catch (error) {
			const message = error?.message || 'There was an error. Please try again later.';
			this.store.uiState.queueNotification(message, 'error');
			process.env.REACT_APP_BUILD_ENV != 'production' && console.error(error);
		} finally {
			this.loadingNfts = false;
		}
	});

	redeemNFT = action(async (tokenId: string, amount: number) => {
		try {
			const { queueNotification, gasPrice } = this.store.uiState;
			const { address, wallet } = this.store.onboard;
			const { gasPrices, network } = this.store.network;
			if (!address || !wallet || network.id !== NETWORK_IDS.ETH) return;

			this.nftBeingRedeemed.push(tokenId);
			const web3 = new Web3(wallet.provider);
			const pool = new web3.eth.Contract(scarcityPoolABI as AbiItem[], mainnet.honeypotMeme);
			const memeLtdAddress = await pool.methods.memeLtd().call();
			const memeLtd = new web3.eth.Contract(memeLtdABI as AbiItem[], memeLtdAddress);

			const redeem = memeLtd.methods.safeTransferFrom(address, mainnet.honeypotMeme, tokenId, amount, '0x00');

			queueNotification(`Sign the transaction to redeem your NFT`, 'info');

			const price = gasPrices ? gasPrices[gasPrice] : 0;
			const options = await getSendOptions(redeem, address, price);
			await sendContractMethod(this.store, redeem, options, `Redemption submitted.`, `NFT Redeemed.`);
			this.fetchPoolBalance();
			this.fetchNFTS();
			this.nftBeingRedeemed = this.nftBeingRedeemed.filter((id) => id !== tokenId);
		} catch (error) {
			const message = error?.message || 'There was an error. Please try again later.';
			this.store.uiState.queueNotification(message, 'error');
			process.env.REACT_APP_BUILD_ENV != 'production' && console.error(error);
			this.nftBeingRedeemed = this.nftBeingRedeemed.filter((id) => id === tokenId);
		}
	});

	calculateRedemptionRate(root: NFT['root']): BigNumber {
		if (!this.poolBalance || !this.nfts) return new BigNumber('0');

		const totalNftSupply = this.nfts.reduce((acc: number, { totalSupply }) => +totalSupply + acc, 0);
		const totalPoolNftBalance = this.nfts.reduce((acc: number, { poolBalance }) => +poolBalance + acc, 0);
		const exponential = +root / 10000;

		if (totalNftSupply - totalPoolNftBalance <= 0) return new BigNumber('0');

		const redemptionRatio = 1 / (totalNftSupply - totalPoolNftBalance);

		// formula is bDiggRemaining*{[amountToRedeem/(totalSupplyOfNft - poolBalanceOfNft)]^root}
		return this.poolBalance.multipliedBy(Math.pow(redemptionRatio, exponential));
	}
}
