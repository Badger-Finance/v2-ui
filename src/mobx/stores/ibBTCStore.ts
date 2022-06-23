import { Network, Token } from '@badger-dao/sdk';
import addresses from 'config/ibBTC/addresses.json';
import { BigNumber } from 'ethers';
import { action, computed, extendObservable } from 'mobx';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { toast } from 'react-toastify';

import { RootStore } from './RootStore';

class IbBTCStore {
  private readonly store: RootStore;

  public mintRates: Record<string, string> = {};
  public redeemRates: Record<string, string> = {};
  public apyUsingLastDay?: string | null;
  public apyUsingLastWeek?: string | null;
  public mintFeePercent?: number;
  public redeemFeePercent?: number;

  constructor(store: RootStore) {
    this.store = store;

    extendObservable(this, {
      apyUsingLastDay: this.apyUsingLastDay,
      apyUsingLastWeek: this.apyUsingLastWeek,
      mintFeePercent: this.mintFeePercent,
      redeemFeePercent: this.redeemFeePercent,
      mintRates: this.mintRates,
      redeemRates: this.redeemRates,
    });
  }

  @computed
  get ibBTC(): TokenBalance {
    return this.store.user.getBalance(ETH_DEPLOY.tokens['ibBTC']);
  }

  @computed
  get tokenBalances(): TokenBalance[] {
    return [
      this.store.user.getBalance(
        ETH_DEPLOY.sett_system.vaults['native.renCrv'],
      ),
      this.store.user.getBalance(ETH_DEPLOY.tokens['renBTC']),
      this.store.user.getBalance(ETH_DEPLOY.tokens['wBTC']),
      this.store.user.getBalance(
        ETH_DEPLOY.sett_system.vaults['native.sbtcCrv'],
      ),
      this.store.user.getBalance(
        ETH_DEPLOY.sett_system.vaults['native.tbtcCrv'],
      ),
      this.store.user.getBalance(ETH_DEPLOY.tokens['bWBTC']),
      this.store.user.getBalance(
        ETH_DEPLOY.sett_system.vaults['native.hbtcCrv'],
      ),
      this.store.user.getBalance(
        ETH_DEPLOY.sett_system.vaults['native.bbtcCrv'],
      ),
      this.store.user.getBalance(
        ETH_DEPLOY.sett_system.vaults['native.obtcCrv'],
      ),
      this.store.user.getBalance(
        ETH_DEPLOY.sett_system.vaults['native.pbtcCrv'],
      ),
    ];
  }

  @computed
  get initialized(): boolean {
    const mintRatesAvailable = Object.keys(this.mintRates).length > 0;
    const redeemRatesAvailable = Object.keys(this.redeemRates).length > 0;
    const feesAreLoaded = !!this.mintFeePercent && !!this.redeemFeePercent;
    const tokensInformationIsLoaded = this.tokenBalances.every(
      (option) => !!option.token.name && !!option.token.symbol,
    );

    return (
      mintRatesAvailable &&
      redeemRatesAvailable &&
      feesAreLoaded &&
      tokensInformationIsLoaded
    );
  }

  get mintOptions(): TokenBalance[] {
    return this.tokenBalances;
  }

  // currently, the zap contract does not support redeem
  get redeemOptions(): TokenBalance[] {
    return this.tokenBalances.filter(({ token }) =>
      addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(
        token.address,
      ),
    );
  }

  async init(): Promise<void> {
    const { address } = this.store.wallet;
    const { config: network } = this.store.sdk;

    // kek we done did it again, the network network :gigabrain:
    if (this.initialized || network.network !== Network.Ethereum || !address) {
      return;
    }

    await Promise.all([this.fetchConversionRates(), this.fetchFees()]).catch(
      (err) => {
        if (DEBUG) {
          console.error(err);
        }
        return;
      },
    );
  }

  fetchFees = action(async (): Promise<void> => {
    const fees = await this.store.sdk.ibbtc.getFees();
    this.mintFeePercent = fees.mintFee;
    this.redeemFeePercent = fees.redeemFee;
  });

  fetchConversionRates = action(async (): Promise<void> => {
    const [fetchMintRates, fetchRedeemRates] = await Promise.all([
      Promise.all(this.mintOptions.map((_o) => this.fetchMintRate())),
      Promise.all(
        this.redeemOptions.map(({ token }) => this.fetchRedeemRate(token)),
      ),
    ]);

    for (let i = 0; i < fetchMintRates.length; i++) {
      this.mintRates[this.mintOptions[i].token.address] = fetchMintRates[i];
    }

    for (let i = 0; i < fetchRedeemRates.length; i++) {
      this.redeemRates[this.mintOptions[i].token.address] = fetchRedeemRates[i];
    }
  });

  fetchMintRate = action(async (): Promise<string> => {
    try {
      const { bbtc, fee } = await this.store.sdk.ibbtc.estimateMint(
        BigNumber.from(1),
      );
      return TokenBalance.fromBigNumber(
        this.ibBTC,
        bbtc.add(fee),
      ).balanceDisplay(6);
    } catch (error) {
      return '0.000';
    }
  });

  fetchRedeemRate = action(async (token: Token): Promise<string> => {
    try {
      const redeemRate = await this.getRedeemConversionRate(token);
      return TokenBalance.fromBigNumber(this.ibBTC, redeemRate).balanceDisplay(
        6,
      );
    } catch (error) {
      return '0.000';
    }
  });

  isZapToken(token: Token): boolean {
    return !addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(
      token.address,
    );
  }

  isValidAmount(
    amount: TokenBalance,
    tokenBalance: TokenBalance,
    slippage?: BigNumber,
  ): boolean {
    if (amount.tokenBalance.lte(0)) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (amount.tokenBalance.gt(tokenBalance.tokenBalance)) {
      toast.error(`You have insufficient balance of ${amount.token.symbol}`);
      return false;
    }

    if (this.isZapToken(amount.token) && slippage?.lte(0)) {
      toast.error('Please enter a valid slippage value');
      return false;
    }

    return true;
  }

  async getRedeemConversionRate(token: Token): Promise<BigNumber> {
    // const { web3Instance } = this.store.wallet;
    // if (!web3Instance) return ZERO;

    // const ibBTC = new web3Instance.eth.Contract(
    //   ibBTCConfig.abi as AbiItem[],
    //   this.ibBTC.token.address,
    // );
    // const ibBTCPricePerShare = await ibBTC.methods.pricePerShare().call();

    // return IbBTCMintZapFactory.getIbBTCZap(this.store, token).bBTCToSett(
    //   new BigNumber(ibBTCPricePerShare),
    // );
    return BigNumber.from('0');
  }
}

export default IbBTCStore;
