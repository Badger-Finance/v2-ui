import { RootStore } from '../RootStore';
import { extendObservable } from 'mobx';
import { Network } from '../model/network/network';
import { NETWORKS_LOCKED_DEPOSITS_CONFIG } from '../../config/networks-locked-deposits';
import { ERC20__factory, VoteLockedDeposit__factory } from '../../contracts';
import { BigNumber } from 'bignumber.js';
import { TokenBalance } from '../model/tokens/token-balance';
import { LockedContractInfo } from '../model/locked-deposits/locked-contract-info';
import { ethers } from 'ethers';
import { formatBalance } from '@badger-dao/sdk';

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
			wallet: { web3Instance },
		} = this.store;

		const tokens = NETWORKS_LOCKED_DEPOSITS_CONFIG[network.id];

		if (!web3Instance || !tokens) {
			return;
		}

		const balances = await Promise.all(tokens.map(this.getLockedDepositBalance));
		this.networksLockedDeposits.set(network.id, new Map(balances.flat()));
	}

	private getLockedDepositBalance = async ({
		vaultAddress,
		lockingContractAddress,
	}: LockedContractInfo): Promise<[string, TokenBalance][]> => {
		const {
			wallet: { provider },
		} = this.store;

		if (!provider) {
			return [];
		}

		const vault = this.store.vaults.getVault(vaultAddress);

		if (!vault) {
			return [];
		}

		const token = this.store.vaults.getToken(vault.underlyingToken);
		const tokenContract = ERC20__factory.connect(vault.underlyingToken, provider);
		const voteLockedDepositContract = VoteLockedDeposit__factory.connect(lockingContractAddress, provider);

		const [vaultBalance, strategyBalance, totalTokenBalanceStrategy, lockedTokenBalanceStrategy] =
			await Promise.all([
				await tokenContract.balanceOf(vault.vaultToken),
				await tokenContract.balanceOf(vault.strategy.address),
				await voteLockedDepositContract.lockedBalanceOf(vaultAddress),
				await voteLockedDepositContract.balanceOf(vaultAddress),
			]);

		console.log({
			locker: voteLockedDepositContract.address,
			vaultAddress,
			vaultBalance: formatBalance(vaultBalance),
			strategyBalance: formatBalance(strategyBalance),
			totalTokenBalanceStrategy,
			lockedTokenBalanceStrategy,
		});

		const balance = new BigNumber(
			vaultBalance.add(strategyBalance).add(totalTokenBalanceStrategy).sub(lockedTokenBalanceStrategy)._hex,
		);

		return [[vault.underlyingToken, new TokenBalance(token, balance, balance)]];
	};
}

export default LockedDepositsStore;
