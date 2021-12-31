import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { EIP1559SendOptions, getSendOptions, sendContractMethod } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../RootStore';
import { ContractSendMethod, SendOptions } from 'web3-eth-contract';
import { ERC20, MAX, SETT_ABI, YEARN_ABI } from 'config/constants';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { toFixedDecimals, unscale } from '../utils/helpers';
import { action, extendObservable } from 'mobx';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { BouncerType, GasSpeed, Vault, Token } from '@badger-dao/sdk';

type ProgressTracker = Record<string, boolean>;

class ContractsStore {
  private store!: RootStore;
  public settsBeingDeposited: ProgressTracker = {};
  public settsBeingUnstaked: ProgressTracker = {};
  public settsBeingWithdrawn: ProgressTracker = {};

  constructor(store: RootStore) {
    this.store = store;

    extendObservable(this, {
      settsBeingDeposited: this.settsBeingDeposited,
      settsBeingUnstaked: this.settsBeingUnstaked,
      settsBeingWithdrawn: this.settsBeingWithdrawn,
    });
  }

  /* Contract Interaction Methods */

  deposit = async (
    sett: Vault,
    badgerSett: BadgerSett,
    userBalance: TokenBalance,
    depositAmount: TokenBalance,
  ): Promise<void> => {
    const { queueNotification } = this.store.uiState;
    const amount = depositAmount.balance;
    const depositToken = this.store.setts.getToken(sett.underlyingToken);

    if (!depositToken) {
      return;
    }

    if (amount.isNaN() || amount.lte(0) || amount.gt(userBalance.balance)) {
      queueNotification('Please enter a valid amount', 'error');
      return;
    }

    const allowance = await this.getAllowance(depositToken, badgerSett.vaultToken.address);

    if (amount.gt(allowance.balance)) {
      await this.increaseAllowance(depositToken, badgerSett.vaultToken.address);
    }

    await this.depositVault(sett, depositAmount);
  };

  withdraw = async (
    sett: Vault,
    badgerSett: BadgerSett,
    userBalance: TokenBalance,
    withdrawAmount: TokenBalance,
  ): Promise<void> => {
    const { queueNotification } = this.store.uiState;
    const amount = withdrawAmount.balance;

    // ensure balance is valid
    if (amount.isNaN() || amount.lte(0) || amount.gt(userBalance.balance)) {
      queueNotification('Please enter a valid amount', 'error');
      return;
    }

    await this.withdrawVault(sett, badgerSett, withdrawAmount);
  };

  increaseAllowance = async (token: Token, contract: string): Promise<void> => {
    const {
      onboard,
      uiState: { queueNotification },
    } = this.store;

    const web3 = new Web3(onboard.wallet?.provider);
    const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], token.address);
    // provide infinite approval
    const method: ContractSendMethod = underlyingContract.methods.approve(contract, MAX);
    const options = await this.getMethodSendOptions(method);
    const infoMessage = 'Transaction submitted';
    const successMessage = `${token.symbol} allowance increased`;

    queueNotification(`Sign the transaction to allow Badger to spend your ${token.symbol}`, 'info');
    await sendContractMethod(this.store, method, options, infoMessage, successMessage);
  };

  getAllowance = async (token: Token, spender: string): Promise<TokenBalance> => {
    const { onboard } = this.store;

    if (!onboard.address) {
      throw Error('Disconnected while fetching allowance');
    }

    const web3 = new Web3(onboard.wallet?.provider);
    const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], token.address);
    const allowance = await underlyingContract.methods.allowance(onboard.address, spender).call();

    return new TokenBalance(token, new BigNumber(allowance), new BigNumber(0));
  };

  depositVault = action(async (sett: Vault, amount: TokenBalance, depositAll?: boolean): Promise<void> => {
    const { queueNotification } = this.store.uiState;
    const { bouncerProof } = this.store.user;
    const { onboard } = this.store;

    const web3 = new Web3(onboard.wallet?.provider);
    const settContract = new web3.eth.Contract(SETT_ABI, sett.vaultToken);
    const yearnContract = new web3.eth.Contract(YEARN_ABI, sett.vaultToken);
    const depositBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
    let method: ContractSendMethod = settContract.methods.deposit(depositBalance);

    // TODO: Clean this up, too many branches
    // Uncapped deposits on a wrapper still require an empty proof
    // TODO: better designate abi <> sett pairing, single yearn vault uses yearn ABI.
    if (sett.vaultToken === Web3.utils.toChecksumAddress(ETH_DEPLOY.sett_system.vaults['yearn.wBtc'])) {
      if (depositAll) {
        method = yearnContract.methods.deposit([]);
      } else {
        method = yearnContract.methods.deposit(depositBalance, []);
      }
    }

    if (sett.bouncer === BouncerType.Badger) {
      if (!bouncerProof) {
        queueNotification(`Error loading Badger Bouncer Proof`, 'error');
        return;
      }
      if (depositAll) {
        method = settContract.methods.deposit(bouncerProof);
      } else {
        method = settContract.methods.deposit(depositBalance, bouncerProof);
      }
    } else if (depositAll) {
      method = settContract.methods.depositAll();
    }

    const options = await this.getMethodSendOptions(method);
    const { tokenBalance, token } = amount;
    const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
    const depositAmount = `${displayAmount} ${sett.asset}`;

    queueNotification(`Sign the transaction to deposit ${depositAmount}`, 'info');
    await sendContractMethod(
      this.store,
      method,
      options,
      'Deposing transaction submitted',
      `Successfully deposited ${depositAmount}`,
    );
  });

  withdrawVault = action(async (sett: Vault, badgerSett: BadgerSett, amount: TokenBalance): Promise<void> => {
    const { onboard } = this.store;
    const { queueNotification } = this.store.uiState;

    const web3 = new Web3(onboard.wallet?.provider);
    const underlyingContract = new web3.eth.Contract(SETT_ABI, badgerSett.vaultToken.address);
    const withdrawBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
    const method = underlyingContract.methods.withdraw(withdrawBalance);
    const options = await this.getMethodSendOptions(method);

    const { tokenBalance, token } = amount;
    const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
    const withdrawAmount = `${displayAmount} b${sett.asset}`;

    queueNotification(`Sign the transaction to withdraw ${withdrawAmount}`, 'info');
    await sendContractMethod(
      this.store,
      method,
      options,
      'Withdraw transaction submitted',
      `Successfully withdrew ${withdrawAmount}`,
    );
  });

  getMethodSendOptions = async (method: ContractSendMethod): Promise<SendOptions | EIP1559SendOptions> => {
    const {
      onboard,
      network: { gasPrices },
    } = this.store;
    if (!onboard.address) {
      throw Error('Sending tx without a connected account');
    }
    const price = gasPrices ? gasPrices[GasSpeed.Fast] : 0;
    return await getSendOptions(method, onboard.address, price);
  };
}

export default ContractsStore;
