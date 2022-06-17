/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export declare namespace CvxLocker {
  export type LockedBalanceStruct = {
    amount: BigNumberish;
    boosted: BigNumberish;
    unlockTime: BigNumberish;
  };

  export type LockedBalanceStructOutput = [BigNumber, BigNumber, number] & {
    amount: BigNumber;
    boosted: BigNumber;
    unlockTime: number;
  };
}

export interface VoteLockedDepositInterface extends utils.Interface {
  functions: {
    "balanceOf(address)": FunctionFragment;
    "lockedBalanceOf(address)": FunctionFragment;
    "lockedBalances(address)": FunctionFragment;
    "lockedSupply()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "balanceOf"
      | "lockedBalanceOf"
      | "lockedBalances"
      | "lockedSupply"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(
    functionFragment: "lockedBalanceOf",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "lockedBalances",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "lockedSupply",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "lockedBalanceOf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lockedBalances",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lockedSupply",
    data: BytesLike
  ): Result;

  events: {};
}

export interface VoteLockedDeposit extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VoteLockedDepositInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    balanceOf(
      _user: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { amount: BigNumber }>;

    lockedBalanceOf(
      _user: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { amount: BigNumber }>;

    lockedBalances(
      _user: string,
      overrides?: CallOverrides
    ): Promise<
      [
        BigNumber,
        BigNumber,
        BigNumber,
        CvxLocker.LockedBalanceStructOutput[]
      ] & {
        total: BigNumber;
        unlockable: BigNumber;
        locked: BigNumber;
        lockData: CvxLocker.LockedBalanceStructOutput[];
      }
    >;

    lockedSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  balanceOf(_user: string, overrides?: CallOverrides): Promise<BigNumber>;

  lockedBalanceOf(_user: string, overrides?: CallOverrides): Promise<BigNumber>;

  lockedBalances(
    _user: string,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, CvxLocker.LockedBalanceStructOutput[]] & {
      total: BigNumber;
      unlockable: BigNumber;
      locked: BigNumber;
      lockData: CvxLocker.LockedBalanceStructOutput[];
    }
  >;

  lockedSupply(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    balanceOf(_user: string, overrides?: CallOverrides): Promise<BigNumber>;

    lockedBalanceOf(
      _user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lockedBalances(
      _user: string,
      overrides?: CallOverrides
    ): Promise<
      [
        BigNumber,
        BigNumber,
        BigNumber,
        CvxLocker.LockedBalanceStructOutput[]
      ] & {
        total: BigNumber;
        unlockable: BigNumber;
        locked: BigNumber;
        lockData: CvxLocker.LockedBalanceStructOutput[];
      }
    >;

    lockedSupply(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    balanceOf(_user: string, overrides?: CallOverrides): Promise<BigNumber>;

    lockedBalanceOf(
      _user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lockedBalances(
      _user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lockedSupply(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(
      _user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lockedBalanceOf(
      _user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lockedBalances(
      _user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lockedSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
