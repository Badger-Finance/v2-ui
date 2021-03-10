import Web3 from 'web3';
import { action, observe, extendObservable } from 'mobx';
import { RootStore } from 'mobx/store';
import { getClawEmp, getClawEmpSponsor } from 'mobx/utils/api';
import BigNumber from 'bignumber.js';
import {
	EMPS_ADDRESSES,
	reduceEclawByCollateral,
	reduceCollaterals,
	reduceEclaws,
	reduceSponsorData,
	reduceSyntheticsData,
} from 'mobx/reducers/clawsReducer';
import { ERC20 } from 'config/constants';
import { AbiItem } from 'web3-utils';
import { estimateAndSend } from 'mobx/utils/web3';
import { method } from 'lodash';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';

export interface DepositMint {
	empAddress: string;
	collateralAmount: BigNumber;
	syntheticAmount: string;
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

export class ClawStore {
	store: RootStore;
	syntheticsData: SyntheticData[] = [];
	sponsorInformation: SponsorData[] = [];
	syntheticsDataByEMP: Map<string, SyntheticData> = new Map();
	sponsorInformationByEMP: Map<string, SponsorData> = new Map();
	collaterals: Map<string, string> = new Map();
	eClaws: Map<string, string> = new Map();
	eclawsByCollateral: Map<string, Map<string, string>> = new Map();
	isLoading = false;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			syntheticsData: this.syntheticsData,
			sponsorInformation: this.sponsorInformation,
			isLoading: this.isLoading,
			syntheticsDataByEMP: this.syntheticsDataByEMP,
			sponsorInformationByEMP: this.sponsorInformationByEMP,
			collaterals: this.collaterals,
			eClaws: this.eClaws,
			collateralEclawRelation: this.eclawsByCollateral,
		});

		observe(this.store.wallet, 'connectedAddress', () => {
			if (this.store.wallet.connectedAddress && this.sponsorInformation.length === 0 && !this.isLoading) {
				this.fetchSponsorData();
			}
		});

		if (this.syntheticsData.length === 0) this.fetchData();
	}

	depositMint = action(async ({ empAddress, collateralAmount, syntheticAmount }: DepositMint) => {
		const { queueNotification } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;
		const synthetic = this.syntheticsDataByEMP.get(empAddress);

		if (!synthetic || !connectedAddress) return;

		await this.approveCollateralSpending(collateralAmount, empAddress, synthetic);
	});

	fetchData = action(async () => {
		const isSponsorInformationEmpty = this.sponsorInformation.length === 0;
		const isWalletConnected = !!this.store.wallet.connectedAddress;
		await this.fetchSyntheticsData();
		if (isWalletConnected && isSponsorInformationEmpty) await this.fetchSponsorData();
	});

	fetchSyntheticsData = action(async () => {
		try {
			this.isLoading = true;
			this.syntheticsData = await this.fetchEmps();
			this.syntheticsDataByEMP = reduceSyntheticsData(this);
			this.collaterals = reduceCollaterals(this);
			this.eclawsByCollateral = reduceEclawByCollateral(this);
			this.eClaws = reduceEclaws();
		} catch (error) {
			console.log(error);
		} finally {
			this.isLoading = false;
		}
	});

	fetchSponsorData = action(async () => {
		const { connectedAddress } = this.store.wallet;
		try {
			this.isLoading = true;
			this.sponsorInformation = await Promise.all(
				EMPS_ADDRESSES.map((synthetic) => getClawEmpSponsor(synthetic, connectedAddress)),
			);
			this.sponsorInformationByEMP = reduceSponsorData(this);
		} catch (error) {
			console.log(error);
		} finally {
			this.isLoading = false;
		}
	});

	// TODO: make approve call only if required
	private async approveCollateralSpending(amount: BigNumber, empAddress: string, synthetic: SyntheticData) {
		const { queueNotification } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const syntheticToken = new web3.eth.Contract(ERC20.abi as AbiItem[], synthetic.tokenCurrency);
		const approveCollateralSpending = syntheticToken.methods.approve(empAddress, amount.toString());

		queueNotification(`First, you need to approve your collateral spending`, 'info');

		return new Promise<void>((onSuccess, onError) => {
			estimateAndSend(
				web3,
				this.store.wallet.gasPrices[this.store.uiState.gasPrice],
				approveCollateralSpending,
				connectedAddress,
				(transaction: PromiEvent<Contract>) => {
					transaction
						.on('transactionHash', (hash) => {
							queueNotification(`Transaction submitted.`, 'info', hash);
						})
						.on('receipt', () => {
							queueNotification(`Collateral Spending `, 'success');
							onSuccess();
						})
						.catch((error: any) => {
							onError(error);
						});
				},
			);
		});
	}

	private async fetchEmps(): Promise<SyntheticData[]> {
		const eclaws = await Promise.all(EMPS_ADDRESSES.map((synthetic) => getClawEmp(synthetic)));
		return this.addEmpAddress(eclaws);
	}

	private addEmpAddress(data: SyntheticData[]) {
		return data.map((s, index) => ({ ...s, address: EMPS_ADDRESSES[index] }));
	}
}

export default ClawStore;
