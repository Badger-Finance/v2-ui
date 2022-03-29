import { RootStore } from '../RootStore';
import { extendObservable } from 'mobx';
import { Network } from '../model/network/network';
import { NETWORKS_LOCKED_DEPOSITS_CONFIG } from '../../config/networks-locked-deposits';
import { ERC20__factory, VoteLockedDeposit__factory } from '../../contracts';
import { BigNumber } from 'bignumber.js';
import { TokenBalance } from '../model/tokens/token-balance';
import { LockedContractInfo } from '../model/locked-deposits/locked-contract-info';
import { ethers } from 'ethers';

type LockedDepositBalancesMap = Map<string, TokenBalance>;

class LockedDepositsStore {
	private readonly store: RootStore;
	private networksLockedDeposits = new Map<Network['id'], LockedDepositBalancesMap>();

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			networksLockedDeposits: this.networksLockedDeposits,
		});
	}

	getLockedDepositBalances(address: string): TokenBalance | undefined {
		return this.networksLockedDeposits.get(this.store.network.network.id)?.get(ethers.utils.getAddress(address));
	}

	async loadLockedBalances(): Promise<void> {
		const {
			network: { network },
			onboard: { wallet },
		} = this.store;

		if (!wallet?.provider) {
			return;
		}

		const tokens = NETWORKS_LOCKED_DEPOSITS_CONFIG[network.id];
		const balances = await Promise.all(tokens.map(this.getLockedDepositBalance));
		this.networksLockedDeposits.set(network.id, new Map(balances.flat()));
	}

	private getLockedDepositBalance = async ({
		vaultAddress,
		lockingContractAddress,
		underlyingTokenAddress,
		strategyAddress,
	}: LockedContractInfo): Promise<[string, TokenBalance][]> => {
		const {
			onboard: { ethersWeb3Provider },
		} = this.store;

		if (!ethersWeb3Provider) {
			return [];
		}

		const token = this.store.vaults.getToken(underlyingTokenAddress);
		const tokenContract = ERC20__factory.connect(underlyingTokenAddress, ethersWeb3Provider);
		const voteLockedDepositContract = VoteLockedDeposit__factory.connect(
			lockingContractAddress,
			ethersWeb3Provider,
		);

		const [vaultBalance, strategyBalance, totalTokenBalanceStrategy, lockedTokenBalanceStrategy] =
			await Promise.all([
				await tokenContract.balanceOf(vaultAddress),
				await tokenContract.balanceOf(strategyAddress),
				await voteLockedDepositContract.lockedBalanceOf(vaultAddress),
				await voteLockedDepositContract.balanceOf(vaultAddress),
			]);

		const balance = new BigNumber(
			vaultBalance.add(strategyBalance).add(totalTokenBalanceStrategy).sub(lockedTokenBalanceStrategy)._hex,
		);

		return [[ethers.utils.getAddress(underlyingTokenAddress), new TokenBalance(token, balance, balance)]];
	};
}

export default LockedDepositsStore;
