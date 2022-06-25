import { RootStore } from '../RootStore';
import { VaultChartData, VaultChartTimeframe } from '../model/vaults/vault-charts';
import { computed, extendObservable } from 'mobx';
import mainnetDeploy from '../../config/deployments/mainnet.json';
import { EmissionSchedule, VaultDTO } from '@badger-dao/sdk';
import { CurveFactoryPool__factory } from '../../contracts';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

const BVE_CVX_ADDRESS = mainnetDeploy.sett_system.vaults['native.icvx'];
const CURVE_POOL_ADDRESS = '0x04c90C198b2eFF55716079bc06d7CCc4aa4d7512';

class BveCvxInfluenceStore {
	private readonly store: RootStore;
	private vault: VaultDTO | undefined;
	private vaultChartData?: VaultChartData[] | null;
	private curveSwapPercentage = '';
	private emissionsSchedules?: EmissionSchedule[] | null = null;
	private processingChartData: boolean = true;
	private processingEmissions: boolean = true;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			vault: this.vault,
			vaultChartData: this.vaultChartData,
			processingChartData: this.processingChartData,
			processingEmissions: this.processingEmissions,
			curveSwapPercentage: this.curveSwapPercentage,
			emissionsSchedules: this.emissionsSchedules,
		});
	}

	async init() {
		this.vault = this.store.vaults.getVault(BVE_CVX_ADDRESS);
		await Promise.all([
			this.loadChartInfo(VaultChartTimeframe.Week),
			this.loadEmissionsSchedules(),
			this.loadSwapPercentage(),
		]);
	}

	@computed
	get loadingChart() {
		return this.processingChartData;
	}

	@computed
	get loadingEmissions() {
		return this.processingEmissions;
	}

	@computed
	get emissions() {
		return this.emissionsSchedules;
	}

	@computed
	get chartData() {
		return this.vaultChartData;
	}

	@computed
	get swapPercentage() {
		return this.curveSwapPercentage;
	}

	async loadChartInfo(timeframe: VaultChartTimeframe) {
		if (!this.vault) return;
		try {
			this.processingChartData = true;
			this.vaultChartData = await this.store.vaultCharts.search(this.vault, timeframe);
		} catch (error) {
			console.error(error);
		} finally {
			this.processingChartData = false;
		}
	}

	async loadEmissionsSchedules() {
		if (!this.vault) return;
		try {
			this.processingEmissions = true;
			this.emissionsSchedules = await this.store.sdk.api.loadSchedule(this.vault.vaultToken, false);
		} catch (error) {
			console.error(error);
		} finally {
			this.processingEmissions = false;
		}
	}

	async loadSwapPercentage() {
		const { provider } = this.store.wallet;
		if (!provider || this.curveSwapPercentage) return;
		const curvePool = CurveFactoryPool__factory.connect(CURVE_POOL_ADDRESS, provider);
		const swapAmount = 10_000; // 10k bveCVX;
		// in the pool each token is represented by an index 0 is bveCVX and 1 is CVX
		const estimatedSwap = await curvePool.get_dy(1, 0, parseUnits(String(swapAmount), 'ether'));
		const swap = Number(formatUnits(estimatedSwap, 'ether'));
		const percentage = swap / swapAmount;
		this.curveSwapPercentage = `${(percentage * 100).toFixed(2)}%`;
	}
}

export default BveCvxInfluenceStore;
