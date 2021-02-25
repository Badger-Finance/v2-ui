import BigNumber from 'bignumber.js';
import { observe } from 'mobx';
import { RootStore } from 'mobx/store';
import { getClawEmp, getClawEmpSponsor } from 'mobx/utils/api';

export interface SyntheticData {
	globalCollateralizationRatio: BigNumber;
	totalPositionCollateral: BigNumber; // Total collateral supplied.
	totalTokensOutstanding: BigNumber; // Token debt issued.
	collateralRequirement: BigNumber;
	expirationTimestamp: BigNumber;
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
	liquidations: Liqudation[];
	position: Position;
	pendingWithdrawal: boolean;
}

// Liquidation Interface
interface Liqudation {
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
// Position Interface
interface Position {
	tokensOutstanding: BigNumber;
	withdrawalRequestPassTimestamp: BigNumber;
	withdrawalRequestAmount: BigNumber;
	rawCollateral: BigNumber;
	transferPositionRequestPassTimestamp: BigNumber;
}

export class ClawStore {
	private store: RootStore;
	private readonly synthetics = [
		'0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220',
		'0x5E4a8D011ef8d9E8B407cc87c68bD211B7ac72ab',
	];
	syntheticsData: SyntheticData[] = [];
	sponsorInformation: SponsorData[] = [];
	isLoading = false;

	constructor(store: RootStore) {
		this.store = store;

		observe(this.store.wallet, 'connectedAddress', () => {
			this.fetchSyntheticsData();
			this.fetchSponsorData();
		});
	}

	async fetchSyntheticsData(): Promise<void> {
		this.isLoading = true;
		this.syntheticsData = await Promise.all(this.synthetics.map((syntethic) => getClawEmp(syntethic)));
		this.isLoading = false;
	}

	async fetchSponsorData(): Promise<void> {
		const { connectedAddress } = this.store.wallet;

		this.isLoading = true;
		this.syntheticsData = await Promise.all(
			this.synthetics.map((syntethic) => getClawEmpSponsor(syntethic, connectedAddress)),
		);
		this.isLoading = true;
	}
}
