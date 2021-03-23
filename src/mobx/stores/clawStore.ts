import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { action, observe, extendObservable, toJS } from 'mobx';
import { RootStore } from 'mobx/store';
import { getClawEmp, getClawEmpSponsor } from 'mobx/utils/api';
import BigNumber from 'bignumber.js';
import {
	EMPS_ADDRESSES,
	reduceClawByCollateral,
	reduceCollaterals,
	reduceClaws,
	reduceSponsorData,
	reduceSyntheticsData,
} from 'mobx/reducers/clawsReducer';
import { ERC20 } from 'config/constants';
import EMP from '../../config/system/abis/ExpiringMultiParty.json';
import { estimateAndSend } from 'mobx/utils/web3';

export interface Mint {
	empAddress: string;
	collateralAmount: string;
	mintAmount: string;
}
export interface Redeem {
	empAddress: string;
	numTokens: string;
}
export interface Deposit {
	empAddress: string;
	depositAmount: string;
}
export interface Withdraw {
	empAddress: string;
	collateralAmount: string;
}
export interface RequestWithdrawal {
	empAddress: string;
	collateralAmount: string;
}
export interface SyntheticData {
	// Long name of the synhetic (includes expiration date)
	name: string;
	address: string;
	// Token address of the underlying collateral currency.
	collateralCurrency: string;
	// Token address of the synthetic token currency.
	tokenCurrency: string;
	globalCollateralizationRatio: BigNumber;
	totalPositionCollateral: BigNumber; // Total collateral supplied.
	totalTokensOutstanding: BigNumber; // Token debt issued.
	collateralRequirement: BigNumber;
	expirationTimestamp: BigNumber;
	cumulativeFeeMultiplier: BigNumber;
	// Min number of sponsor tokens to mint (will default to 100 tokens or ~$100).
	minSponsorTokens: BigNumber;
	// Amount of time (in seconds) a sponsor must wait to withdraw without liquidation
	// for "slow" withdrawals.
	withdrawalLiveness: BigNumber;
	// Amount of time (in seconds) a liquidator must wait to liquidate a sponsor
	// position without a dispute.
	liquidationLiveness: BigNumber;
}
export interface SponsorData {
	liquidations: Liquidation[];
	position: Position;
	pendingWithdrawal: boolean;
}

interface Liquidation {
	/*
	 * Following variables set upon creation of liquidation:
	 * Liquidated (and expired or not), Pending a Dispute, or Dispute has resolved
	 *  - 0 == Uninitialized
	 *  - 1 == NotDisputed
	 *  - 2 == Disputed
	 *  - 3 == DisputeSucceeded
	 *  - 4 == DisputeFailed
	 */
	state: BigNumber;
	liquidationTime: BigNumber; // Time when liquidation is initiated, needed to get price from Oracle
	tokensOutstanding: BigNumber; // Synthetic tokens required to be burned by liquidator to initiate dispute
	lockedCollateral: BigNumber; // Collateral locked by contract and released upon expiry or post-dispute
	sponsor: string; // Address of the liquidated position's sponsor
	liquidator: string; // Address who created this liquidation
	// Following variables determined by the position that is being liquidated:
	// Amount of collateral being liquidated, which could be different from
	// lockedCollateral if there were pending withdrawals at the time of liquidation
	liquidatedCollateral: BigNumber;
	// Unit value (starts at 1) that is used to track the fees per unit of collateral over the course of the liquidation.
	rawUnitCollateral: BigNumber;
	// Following variable set upon initiation of a dispute:
	disputer: string; // Person who is disputing a liquidation
	// Following variable set upon a resolution of a dispute:
	settlementPrice: BigNumber; // Final price as determined by an Oracle following a dispute
	finalFee: BigNumber;
}

interface Position {
	tokensOutstanding: BigNumber;
	withdrawalRequestPassTimestamp: BigNumber;
	withdrawalRequestAmount: BigNumber;
	rawCollateral: BigNumber;
	transferPositionRequestPassTimestamp: BigNumber;
}

interface PrepareEmpTransaction {
	method: any;
	informationMessage?: string;
	successMessage?: string;
}

export class ClawStore {
	store: RootStore;
	syntheticsData: SyntheticData[] = [];
	sponsorInformation: SponsorData[] = [];
	syntheticsDataByEMP: Map<string, SyntheticData> = new Map();
	sponsorInformationByEMP: Map<string, SponsorData> = new Map();
	collaterals: Map<string, string> = new Map();
	claws: Map<string, string> = new Map();
	clawsByCollateral: Map<string, Map<string, string>> = new Map();
        // Split up isLoading into two state variables to track individual data loading calls since
        // tracking together is racy as connectedAddress is loaded async and not on construction.
	isLoading = false;
	isLoadingSyntheticData = false;
	isLoadingSponsorData = false;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			syntheticsData: this.syntheticsData,
			sponsorInformation: this.sponsorInformation,
			isLoading: this.isLoading,
                        isLoadingSponsorData: this.isLoadingSponsorData,
                        isLoadingSyntheticData: this.isLoadingSyntheticData,
			syntheticsDataByEMP: this.syntheticsDataByEMP,
			sponsorInformationByEMP: this.sponsorInformationByEMP,
			collaterals: this.collaterals,
			claws: this.claws,
			collateralClawRelation: this.clawsByCollateral,
		});

		observe(this, 'isLoadingSponsorData', () => {
                        this.isLoading = this.isLoadingSponsorData || this.isLoadingSyntheticData;
		});
		observe(this, 'isLoadingSyntheticData', () => {
                        this.isLoading = this.isLoadingSponsorData || this.isLoadingSyntheticData;
		});
		observe(this.store.wallet, 'connectedAddress', () => {
			if (this.store.wallet.connectedAddress && !this.isLoadingSponsorData) {
				this.fetchSponsorData();
			}
		});

		this.fetchSyntheticsData();
	}

	mint = action(async ({ empAddress, collateralAmount, mintAmount }: Mint) => {
		const { queueNotification } = this.store.uiState;
		try {
			const synthetic = this.syntheticsDataByEMP.get(empAddress);
			if (!synthetic) return;

			await this._approveSpendIfRequired(empAddress, synthetic.collateralCurrency, collateralAmount);
			await this._mint(empAddress, collateralAmount, mintAmount);
                        await this._updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error minting', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	redeem = action(async ({ empAddress, numTokens }: Redeem) => {
		const { queueNotification } = this.store.uiState;
		const { fetchTokens } = this.store.contracts;
		try {
			const synthetic = this.syntheticsDataByEMP.get(empAddress);
			if (!synthetic) return;

			await this._approveSpendIfRequired(empAddress, synthetic.tokenCurrency, numTokens);
			await this._redeem(empAddress, numTokens);
                        await this._updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error redeeming collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	withdraw = action(async ({ empAddress, collateralAmount }: Withdraw) => {
		const { queueNotification } = this.store.uiState;
		try {
			await this._withdraw(empAddress, collateralAmount);
                        await this._updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error withdrawing collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	requestWithdrawal = action(async ({ empAddress, collateralAmount }: Withdraw) => {
		const { queueNotification } = this.store.uiState;
		try {
			await this._requestWithdrawal(empAddress, collateralAmount);
		} catch (error) {
			queueNotification(error?.message || 'There was an error requesting withdrawal of collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	withdrawPassedRequest = action(async (empAddress: string) => {
		const { queueNotification } = this.store.uiState;
		try {
			await this._withdrawPassedRequest(empAddress);
                        await this._updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error withdrawing collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	cancelWithdrawal = action(async (empAddress: string) => {
		const { queueNotification } = this.store.uiState;
		try {
			await this._cancelWithdrawal(empAddress);
		} catch (error) {
			queueNotification(error?.message || 'There was an error withdrawing collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	deposit = action(async ({ empAddress, depositAmount}: Deposit) => {
		const { queueNotification } = this.store.uiState;
		try {
			const synthetic = this.syntheticsDataByEMP.get(empAddress);
			if (!synthetic) return;

			await this._approveSpendIfRequired(empAddress, synthetic.collateralCurrency, depositAmount);
			await this._deposit(empAddress, depositAmount);
                        await this._updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error depositing collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	fetchSyntheticsData = action(async () => {
		const { queueNotification } = this.store.uiState;
		try {
			this.isLoadingSyntheticData = true;
			this.syntheticsData = await this._fetchEmps();
			this.syntheticsDataByEMP = reduceSyntheticsData(this);
			this.collaterals = reduceCollaterals(this);
			this.clawsByCollateral = reduceClawByCollateral(this);
			this.claws = reduceClaws();
                        console.log('fetchSyntheticsData syntheticsData ->', toJS(this.syntheticsData), toJS(this.collaterals));
		} catch (error) {
			queueNotification(error?.message || 'There was an error fetching synthetic data', 'error');
		} finally {
			this.isLoadingSyntheticData = false;
		}
	});

	fetchSponsorData = action(async () => {
		const { queueNotification } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;
		try {
			this.isLoadingSponsorData = true;
			this.sponsorInformation = await Promise.all(
				EMPS_ADDRESSES.map((synthetic) => getClawEmpSponsor(synthetic, connectedAddress)),
			);
			this.sponsorInformationByEMP = reduceSponsorData(this);
		} catch (error) {
			queueNotification(error?.message || 'There was an error fetching sponsor data', 'error');
		} finally {
			this.isLoadingSponsorData = false;
		}
	});

	private async _approveSpendIfRequired(empAddress: string, tokenAddress: string, amount: string) {
		const { queueNotification } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;
		const web3 = new Web3(provider);

		const token = new web3.eth.Contract(ERC20.abi as AbiItem[], tokenAddress);
		const approveSpend = token.methods.approve(empAddress, amount.toString());
		const currentAllowance: string = await token.methods.allowance(connectedAddress, empAddress).call();
		const isApprovalNeeded = new BigNumber(currentAllowance).lt(amount);

		if (!isApprovalNeeded) return;

		queueNotification(`First, we need you to approve your collateral spending`, 'info');

		return new Promise<void>((onSuccess, onError) => {
			estimateAndSend(
				web3,
				this.store.wallet.gasPrices[this.store.uiState.gasPrice],
				approveSpend,
				connectedAddress,
				(transaction: PromiEvent<Contract>, error?: Error) => {
                                        if (error) {
                                                queueNotification(error.message || 'There was an error estimating gas', 'error');
                                        }
					transaction
						.on('transactionHash', (hash) => {
							queueNotification(`Transaction submitted.`, 'info', hash);
						})
						.on('receipt', () => {
							queueNotification(`Spending approved`, 'success');
							onSuccess();
						})
						.catch((error: any) => {
							onError(error);
						});
				},
			);
		});
	}

	private async _mint(empAddress: string, collateralAmount: string, mintAmount: string) {
		const emp = this._getEmpContract(empAddress);

		console.log({ rawValue: collateralAmount }, { rawValue: mintAmount });

		const create = emp.methods.create({ rawValue: collateralAmount }, { rawValue: mintAmount });

		return this._getEmpTransactionRequest({
			method: create,
			informationMessage: 'Please sign Mint transaction',
			successMessage: 'Collateral Spending Success',
		});
	}

	private async _redeem(empAddress: string, numTokens: string) {
		const emp = this._getEmpContract(empAddress);
		const redeem = emp.methods.redeem({ rawValue: numTokens });

		return this._getEmpTransactionRequest({
			method: redeem,
			informationMessage: 'Please sign redeem transaction',
			successMessage: 'Redeem success',
		});
	}

	private async _withdraw(empAddress: string, collateralAmount: string) {
		const emp = this._getEmpContract(empAddress);
		const withdraw = emp.methods.requestWithdrawal({ rawValue: collateralAmount });

		return this._getEmpTransactionRequest({
			method: withdraw,
			informationMessage: 'Please sign withdraw transaction',
			successMessage: 'Withdraw success',
		});
	}

	private async _requestWithdrawal(empAddress: string, collateralAmount: string) {
		const emp = this._getEmpContract(empAddress);
		const requestWithdrawal = emp.methods.requestWithdrawal({ rawValue: collateralAmount });

		return this._getEmpTransactionRequest({
			method: requestWithdrawal,
			informationMessage: 'Please sign request withdrawal transaction',
			successMessage: 'Request withdrawal success',
		});
	}

	private async _withdrawPassedRequest(empAddress: string) {
		const emp = this._getEmpContract(empAddress);
		const withdrawPassedRequest = emp.methods.withdrawPassedRequest();

		return this._getEmpTransactionRequest({
			method: withdrawPassedRequest,
			informationMessage: 'Please sign withdraw passed request transaction',
			successMessage: 'Withdraw success',
		});
	}

	private async _cancelWithdrawal(empAddress: string) {
		const emp = this._getEmpContract(empAddress);
		const cancelWithdrawal = emp.methods.cancelWithdrawal();

		return this._getEmpTransactionRequest({
			method: cancelWithdrawal,
			informationMessage: 'Please sign cancel withdrawal request transaction',
			successMessage: 'Withdraw success',
		});
	}

	private async _deposit(empAddress: string, depositAmount: string) {
		const emp = this._getEmpContract(empAddress);
		const deposit = emp.methods.deposit({ rawValue: depositAmount });

		return this._getEmpTransactionRequest({
			method: deposit,
			informationMessage: 'Please sign deposit transaction',
			successMessage: 'Deposit success',
		});
	}

	private _getEmpContract(empAddress: string) {
		const web3 = new Web3(this.store.wallet.provider);
		return new web3.eth.Contract(EMP.abi as AbiItem[], empAddress);
	}

	/**
	 * All EMP transactions follow the same logical structure so we use this method to execute them
	 * @param params method and messages to be used
	 * @returns EMP transaction promise
	 */
	private _getEmpTransactionRequest({ method, informationMessage, successMessage }: PrepareEmpTransaction) {
		const { provider, connectedAddress } = this.store.wallet;
		const { queueNotification } = this.store.uiState;
		const web3 = new Web3(provider);

		informationMessage && queueNotification(informationMessage, 'info');

		return new Promise<void>((onSuccess, onError) => {
			estimateAndSend(
				web3,
				this.store.wallet.gasPrices[this.store.uiState.gasPrice],
				method,
				connectedAddress,
				(transaction: PromiEvent<Contract>, error?: Error) => {
                                        if (error) {
                                                queueNotification(error.message || 'There was an error estimating gas', 'error');
                                        }
					transaction
						.on('transactionHash', (hash) => {
							queueNotification(`Transaction submitted.`, 'info', hash);
						})
						.on('receipt', () => {
							queueNotification(successMessage || 'Success', 'success');
							onSuccess();
						})
						.catch((error: any) => {
							onError(error);
						});
				},
			);
		});
	}

	private async _fetchEmps(): Promise<SyntheticData[]> {
		const claws = await Promise.all(EMPS_ADDRESSES.map((synthetic) => getClawEmp(synthetic)));
		return this._addEmpAddress(claws);
	}

	private _addEmpAddress(data: SyntheticData[]) {
		return data.map((s, index) => ({ ...s, address: EMPS_ADDRESSES[index] }));
	}

        // _updateBalances updates all synthetic/collateral balances and sponsor position.
	private async _updateBalances() {
		const { fetchTokens } = this.store.contracts;
                await Promise.all([
                        // TODO: We should track loading state for token balances as well.
                        fetchTokens(() => {}),
                        this.fetchSponsorData(),
                        this.fetchSyntheticsData(),
                ]);
        }
}

export default ClawStore;
