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
export interface SyntheticData {
	// Long name of the synhetic (includes expiration date)
	name: string;
	address: string;
	// Token address of the underlying collateral currency.
	collateralCurrency: string;
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
			if (this.sponsorInformation.length === 0 && !this.isLoading) this.fetchSponsorData();
		});

		if (this.syntheticsData.length === 0) this.fetchSyntheticsData();
	}

	fetchSyntheticsData = action(async () => {
		try {
			this.isLoading = true;
			console.log('== FETCHING HERE ==');
			this.syntheticsData = await this.fetchEmps();
			this.syntheticsDataByEMP = reduceSyntheticsData(this);
			this.collaterals = reduceCollaterals(this);
			this.eclawsByCollateral = reduceEclawByCollateral(this);
			this.eClaws = reduceEclaws();
			if (this.store.wallet && this.sponsorInformation.length === 0) await this.fetchSponsorData();
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
			console.log('== FETCHING HERE 2==');
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

	private async fetchEmps(): Promise<SyntheticData[]> {
		const eclaws = await Promise.all(EMPS_ADDRESSES.map((synthetic) => getClawEmp(synthetic)));
		return this.addEmpAddress(eclaws);
	}

	private addEmpAddress(data: SyntheticData[]) {
		return data.map((s, index) => ({ ...s, address: EMPS_ADDRESSES[index] }));
	}
}

export default ClawStore;
