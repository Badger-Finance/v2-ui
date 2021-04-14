import { action, extendObservable, observe } from 'mobx';
import { RootStore } from 'mobx/store';
import { SyntheticData, SponsorData } from 'mobx/model';
import { ClawActionStore } from './clawActionStore';
import {
	reduceSyntheticsData,
	reduceCollaterals,
	reduceClawByCollateral,
	reduceClaws,
	EMPS_ADDRESSES,
	reduceSponsorData,
	parseSyntheticHexToBigNumber,
	parseSponsorsHexToBigNumber,
} from 'mobx/reducers/clawsReducer';
import { getClawEmpSponsor, getClawEmp } from 'mobx/utils/apiV2';
import { NETWORK_IDS } from '../../../config/constants';

export class ClawStore {
	store: RootStore;
	actionStore: ClawActionStore;

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
	isLoadingTokens = false;

	constructor(store: RootStore) {
		this.store = store;
		this.actionStore = new ClawActionStore(this);

		extendObservable(this, {
			syntheticsData: this.syntheticsData,
			sponsorInformation: this.sponsorInformation,
			isLoading: this.isLoading,
			isLoadingSponsorData: this.isLoadingSponsorData,
			isLoadingSyntheticData: this.isLoadingSyntheticData,
			syntheticsDataByEMP: this.syntheticsDataByEMP,
			sponsorInformationByEMP: this.sponsorInformationByEMP,
			isLoadingTokens: this.isLoadingTokens,
			collaterals: this.collaterals,
			claws: this.claws,
			collateralClawRelation: this.clawsByCollateral,
		});

		observe(this, 'isLoadingTokens', () => {
			this.isLoading = this.isLoadingSponsorData || this.isLoadingSyntheticData || this.isLoadingTokens;
		});

		observe(this, 'isLoadingSponsorData', () => {
			this.isLoading = this.isLoadingSponsorData || this.isLoadingSyntheticData || this.isLoadingTokens;
		});

		observe(this, 'isLoadingSyntheticData', () => {
			this.isLoading = this.isLoadingSponsorData || this.isLoadingSyntheticData || this.isLoadingTokens;
		});

		observe(this.store.wallet, 'connectedAddress', () => {
			if (this.store.wallet.connectedAddress && !this.isLoadingSponsorData) {
				this.fetchSponsorData().then();
			}
		});

		this.fetchSyntheticsData().then();
	}

	fetchSyntheticsData(): Promise<void> {
		return action(async () => {
			if (this.store.wallet.network.networkId !== NETWORK_IDS.ETH) return;
			const { queueNotification } = this.store.uiState;

			try {
				this.isLoadingSyntheticData = true;
				this.syntheticsData = await this._fetchEmps();
				this.syntheticsDataByEMP = reduceSyntheticsData(this);
				this.collaterals = reduceCollaterals(this);
				this.clawsByCollateral = reduceClawByCollateral(this);
				this.claws = reduceClaws();
			} catch (error) {
				queueNotification('There was an error fetching synthetic data', 'error');
			} finally {
				this.isLoadingSyntheticData = false;
			}
		})();
	}

	fetchSponsorData(): Promise<void> {
		return action(async () => {
			const { queueNotification } = this.store.uiState;
			const { connectedAddress, network } = this.store.wallet;

			if (!connectedAddress || network.networkId !== NETWORK_IDS.ETH) return;

			try {
				this.isLoadingSponsorData = true;
				this.sponsorInformation = await this._getSponsorInformation();
				this.sponsorInformationByEMP = reduceSponsorData(this);
			} catch (error) {
				queueNotification(error?.message || 'There was an error fetching sponsor data', 'error');
			} finally {
				this.isLoadingSponsorData = false;
			}
		})();
	}

	async updateBalances(): Promise<void> {
		await Promise.all([this._loadTokens(), this.fetchSyntheticsData(), this.fetchSponsorData()]);
	}

	private _loadTokens = action(async () => {
		const { queueNotification } = this.store.uiState;
		const { fetchTokens } = this.store.contracts;
		try {
			this.isLoadingTokens = true;
			await fetchTokens();
		} catch (error) {
			queueNotification(error?.message || 'There was an error fetching tokens information', 'error');
			process.env.NODE_ENV !== 'production' && console.error(error);
		}
	});

	private async _fetchEmps(): Promise<SyntheticData[]> {
		const claws = await Promise.all(EMPS_ADDRESSES.map((synthetic) => getClawEmp(synthetic)));
		return claws.map((s, index) => ({ ...s, address: EMPS_ADDRESSES[index] })).map(parseSyntheticHexToBigNumber);
	}

	private async _getSponsorInformation() {
		const sponsorInfo = await Promise.all(
			EMPS_ADDRESSES.map((synthetic) => getClawEmpSponsor(synthetic, this.store.wallet.connectedAddress)),
		);

		return sponsorInfo.map(parseSponsorsHexToBigNumber);
	}
}

export default ClawStore;
