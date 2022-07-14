import { ethers } from 'ethers';
import { extendObservable } from 'mobx';

import { NETWORKS_LOCKED_DEPOSITS_CONFIG } from '../../config/networks-locked-deposits';
import { VoteLockedDeposit__factory } from '../../contracts';
import { LockedContractInfo } from '../model/locked-deposits/locked-contract-info';
import { Chain } from '../model/network/chain';
import { TokenBalance } from '../model/tokens/token-balance';
import { RootStore } from './RootStore';

type LockedDepositBalancesMap = Map<string, TokenBalance>;

class LockedDepositsStore {
  private readonly store: RootStore;
  private networksLockedDeposits = new Map<Chain['id'], LockedDepositBalancesMap>();

  constructor(store: RootStore) {
    this.store = store;

    extendObservable(this, {
      networksLockedDeposits: this.networksLockedDeposits,
    });
  }

  getLockedDepositBalances(address: string): TokenBalance | undefined {
    return this.networksLockedDeposits
      .get(Chain.getChain(this.store.chain.network).id)
      ?.get(ethers.utils.getAddress(address));
  }

  async loadLockedBalances(): Promise<void> {
    const {
      chain: { config },
      sdk: { provider },
    } = this.store;

    const tokens = NETWORKS_LOCKED_DEPOSITS_CONFIG[config.chainId];

    if (!provider || !tokens) {
      return;
    }

    const balances = await Promise.all(tokens.map(this.getLockedDepositBalance));
    this.networksLockedDeposits.set(config.chainId, new Map(balances.flat()));
  }

  private getLockedDepositBalance = async ({
    vaultAddress,
    lockingContractAddress,
  }: LockedContractInfo): Promise<[string, TokenBalance][]> => {
    const {
      sdk: { provider, tokens },
    } = this.store;

    if (!provider) {
      return [];
    }

    const vault = this.store.vaults.getVault(vaultAddress);

    if (!vault) {
      return [];
    }

    const token = this.store.vaults.getToken(vault.underlyingToken);
    const voteLockedDepositContract = VoteLockedDeposit__factory.connect(lockingContractAddress, provider);

    const [vaultBalance, strategyBalance, totalTokenBalanceStrategy, lockedTokenBalanceStrategy] = await Promise.all([
      await tokens.loadBalance(vault.underlyingToken, vault.vaultToken),
      await tokens.loadBalance(vault.underlyingToken, vault.strategy.address),
      await voteLockedDepositContract.lockedBalanceOf(vaultAddress),
      await voteLockedDepositContract.balanceOf(vaultAddress),
    ]);

    const balance = vaultBalance.add(strategyBalance).add(totalTokenBalanceStrategy).sub(lockedTokenBalanceStrategy);
    return [[vault.underlyingToken, new TokenBalance(token, balance, 0)]];
  };
}

export default LockedDepositsStore;
