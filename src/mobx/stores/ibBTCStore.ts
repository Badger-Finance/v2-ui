import { formatBalance, Token } from '@badger-dao/sdk';
import addresses from 'config/ibBTC/addresses.json';
import { BadgerPeakSwap__factory } from 'contracts';
import { parseUnits } from 'ethers/lib/utils';
import { action, makeAutoObservable } from 'mobx';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { toast } from 'react-toastify';

import { RootStore } from './RootStore';

class IbBTCStore {
  private readonly store: RootStore;

  public mintRates: Record<string, string> = {};
  public redeemRates: Record<string, string> = {};
  public mintFeePercent?: number;
  public redeemFeePercent?: number;

  constructor(store: RootStore) {
    this.store = store;
    makeAutoObservable(this);
  }

  get ibBTC(): TokenBalance {
    return this.store.user.getBalance(ETH_DEPLOY.tokens['ibBTC']);
  }

  get tokenBalances(): TokenBalance[] {
    return [
      this.store.user.getBalance(ETH_DEPLOY.sett_system.vaults['native.renCrv']),
      this.store.user.getBalance(ETH_DEPLOY.tokens['renBTC']),
      this.store.user.getBalance(ETH_DEPLOY.tokens['wBTC']),
      this.store.user.getBalance(ETH_DEPLOY.sett_system.vaults['native.sbtcCrv']),
      this.store.user.getBalance(ETH_DEPLOY.sett_system.vaults['native.tbtcCrv']),
      this.store.user.getBalance(ETH_DEPLOY.tokens['bWBTC']),
      this.store.user.getBalance(ETH_DEPLOY.sett_system.vaults['native.hbtcCrv']),
      this.store.user.getBalance(ETH_DEPLOY.sett_system.vaults['native.bbtcCrv']),
      this.store.user.getBalance(ETH_DEPLOY.sett_system.vaults['native.obtcCrv']),
      this.store.user.getBalance(ETH_DEPLOY.sett_system.vaults['native.pbtcCrv']),
    ];
  }

  get initialized(): boolean {
    const mintRatesAvailable = Object.keys(this.mintRates).length > 0;
    const redeemRatesAvailable = Object.keys(this.redeemRates).length > 0;
    const feesAreLoaded = this.mintFeePercent !== undefined && this.redeemFeePercent !== undefined;
    const tokensInformationIsLoaded = this.tokenBalances.every(
      (option) => !!option.token.name && !!option.token.symbol,
    );

    return mintRatesAvailable && redeemRatesAvailable && feesAreLoaded && tokensInformationIsLoaded;
  }

  get mintOptions(): TokenBalance[] {
    return this.tokenBalances;
  }

  // currently, the zap contract does not support redeem
  get redeemOptions(): TokenBalance[] {
    const tokenBalance = this.tokenBalances.filter(({ token }) =>
      addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(token.address),
    );
    tokenBalance.push(this.tokenBalances[0]);
    return tokenBalance;
  }

  async init(): Promise<void> {
    try {
      await Promise.all([this.fetchConversionRates(), this.fetchFees()]);
    } catch (err) {
      console.error({ err, message: 'Failed to initialize ibBTC variables' });
    }
  }

  fetchFees = action(async (): Promise<void> => {
    const fees = await this.store.sdk.ibbtc.getFees();
    this.mintFeePercent = fees.mintFee;
    this.redeemFeePercent = fees.redeemFee;
  });

  fetchConversionRates = action(async (): Promise<void> => {
    const [fetchMintRates, fetchRedeemRates] = await Promise.all([
      Promise.all(this.mintOptions.map((o) => this.fetchMintRate(o))),
      Promise.all(this.redeemOptions.map((_o) => this.fetchRedeemRate())),
    ]);

    for (let i = 0; i < fetchMintRates.length; i++) {
      this.mintRates[this.mintOptions[i].token.address] = fetchMintRates[i];
    }

    for (let i = 0; i < fetchRedeemRates.length; i++) {
      this.redeemRates[this.mintOptions[i].token.address] = fetchRedeemRates[i];
    }
  });

  fetchMintRate = action(async ({ token }: TokenBalance): Promise<string> => {
    try {
      const { bbtc, fee } = await this.store.sdk.ibbtc.estimateMint(token.address, parseUnits('1', token.decimals));
      return TokenBalance.fromBigNumber(this.ibBTC, bbtc.add(fee)).balanceDisplay(6);
    } catch (error) {
      return '0.000';
    }
  });

  fetchRedeemRate = action(async (): Promise<string> => {
    try {
      const redeemRate = await this.getRedeemConversionRate();
      return TokenBalance.fromBalance(this.ibBTC, redeemRate).balanceDisplay(6);
    } catch (error) {
      return '0.000';
    }
  });

  isZapToken(token: Token): boolean {
    return !addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(token.address);
  }

  isValidAmount(amount: TokenBalance, tokenBalance: TokenBalance, slippage?: number): boolean {
    if (amount.tokenBalance.lte(0)) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (amount.tokenBalance.gt(tokenBalance.tokenBalance)) {
      toast.error(`You have insufficient balance of ${amount.token.symbol}`);
      return false;
    }

    if (this.isZapToken(amount.token) && slippage && slippage <= 0) {
      toast.error('Please enter a valid slippage value');
      return false;
    }

    return true;
  }

  async getRedeemConversionRate(): Promise<number> {
    const { sdk } = this.store;
    const ibbtcPpfs = await sdk.ibbtc.getPricePerFullShare();
    const { sett, swap } = await sdk.ibbtc.vaultPeak.pools(0);
    const swapContract = BadgerPeakSwap__factory.connect(swap, sdk.provider);
    const [vault, virtualPrice] = await Promise.all([
      sdk.vaults.loadVault({
        address: sett,
        update: true,
      }),
      swapContract.get_virtual_price(),
    ]);
    const virtualSwapPrice = formatBalance(virtualPrice);
    return ibbtcPpfs / (vault.pricePerFullShare * virtualSwapPrice);
  }
}

export default IbBTCStore;
