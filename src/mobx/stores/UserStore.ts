import { Account, BouncerType, MerkleProof, VaultDTO } from '@badger-dao/sdk';
import { BigNumber, ethers } from 'ethers';
import { action, makeAutoObservable } from 'mobx';
import { TokenBalances } from 'mobx/model/account/user-balances';
import { TokenBalance } from 'mobx/model/tokens/token-balance';

import { RootStore } from './RootStore';

export default class UserStore {
  private store: RootStore;

  // loading: undefined, error: null, present: object
  public bouncerProof?: MerkleProof | null = undefined;
  public accountDetails?: Account | null = undefined;
  public balances: TokenBalances = {};
  public loadingBalances = false;

  constructor(store: RootStore) {
    this.store = store;
    this.loadingBalances = false;

    makeAutoObservable(this, {});
  }

  /* Read Variables */

  onGuestList(vault: VaultDTO): boolean {
    // allow users who are not connected to nicely view setts
    if (!this.store.wallet.isConnected) {
      return true;
    }
    if (vault.bouncer === BouncerType.Internal) {
      return false;
    }
    if (vault.bouncer === BouncerType.None) {
      return true;
    }
    return !!this.bouncerProof && this.bouncerProof.length > 0;
  }

  get portfolioValue(): number {
    const { tree } = this.store;
    const rewardsValue = Object.values(tree.claimable).reduce((total, c) => (total += c.value), 0);
    const walletValue = Object.values(this.balances)
      .filter((t) => this.store.vaults.protocolTokens?.has(t.token.address))
      .reduce((total, token) => (total += token.value), 0);
    return rewardsValue + walletValue;
  }

  async reloadBalances(): Promise<void> {
    const { wallet } = this.store;

    if (wallet.address) {
      await Promise.all([this.updateBalances(), this.loadAccountDetails(wallet.address)]);
    }
  }

  getBalance(contract: string): TokenBalance {
    const tokenAddress = ethers.utils.getAddress(contract);
    const balance = this.balances[tokenAddress];
    if (!balance) {
      return new TokenBalance(
        this.store.vaults.getToken(tokenAddress),
        BigNumber.from(0),
        this.store.prices.getPrice(tokenAddress),
      );
    }
    return balance;
  }

  /* User Data Retrieval */

  loadBouncerProof = action(async (address: string): Promise<void> => {
    try {
      const proof = await this.store.api.loadProof(address);
      if (proof) {
        this.bouncerProof = proof;
      }
    } catch {
      console.debug(`No bouncer proof found for: ${address}`);
    } // ignore non 200 responses
  });

  private loadAccountDetails = action(async (address: string): Promise<void> => {
    const accountDetails = await this.store.api.loadAccount(address);
    if (accountDetails) {
      this.accountDetails = accountDetails;
    }
  });

  private updateBalances = action(async (): Promise<void> => {
    const { vaults, prices, sdk } = this.store;

    /**
     * only allow one set of calls at a time, blocked by a loading guard
     * do not update balances without prices available or a provider, price updates
     * will trigger balance display updates
     */
    if (this.loadingBalances) {
      return;
    }

    this.loadingBalances = true;

    try {
      const balances = await sdk.tokens.loadBalances(Object.keys(vaults.tokenConfig));
      this.balances = Object.fromEntries(
        Object.entries(balances).map((b) => {
          const [token, balance] = b;
          const price = prices.getPrice(token);
          const tokenInfo = vaults.getToken(token);
          const tokenBalance = new TokenBalance(tokenInfo, balance, price);
          return [token, tokenBalance];
        }),
      );

      // TODO: add vault caps checks + guest list look ups

      this.loadingBalances = false;
    } catch (err) {
      console.error(err);
      this.loadingBalances = false;
    }
  });
}
