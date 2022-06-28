import { RootStore } from '../RootStore';
import { VaultChartData, VaultChartTimeframe } from '../model/vaults/vault-charts';
import { computed, extendObservable } from 'mobx';
import mainnetDeploy from '../../config/deployments/mainnet.json';
import { EmissionSchedule, formatBalance, ONE_DAY_MS, VaultDTO } from '@badger-dao/sdk';
import { CurveFactoryPool__factory } from '../../contracts';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { BveCvxEmissionRound } from 'mobx/model/charts/bve-cvx-emission-round';

const BVE_CVX_ADDRESS = mainnetDeploy.sett_system.vaults['native.icvx'];
const CURVE_POOL_ADDRESS = '0x04c90C198b2eFF55716079bc06d7CCc4aa4d7512';
const ROUND_ONE_START = 1632182660;
const BADGER_TOKEN = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
const BVE_CVX_TOKEN = '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305';
const BCVX_CRV_TOKEN = '0x2B5455aac8d64C14786c3a29858E43b5945819C0';

function isOverlapping(original: EmissionSchedule, other: EmissionSchedule): boolean {
	return original.token === other.token && Math.abs(original.start - other.start) > 14 * (ONE_DAY_MS / 1000);
}

class BveCvxInfluenceStore {
	private readonly store: RootStore;
	private vault: VaultDTO | undefined;
	private vaultChartData?: VaultChartData[] | null;
	private curveSwapPercentage = '';
	private emissionsSchedules?: BveCvxEmissionRound[] | null = null;
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
			const treeSchedules = await this.store.sdk.api.loadSchedule(this.vault.vaultToken, false);
			const { badgerTreeDistributions } = await this.store.sdk.graph.loadBadgerTreeDistributions({
				where: {
					sett: this.vault.vaultToken.toLowerCase(),
				},
			});
			const harvestConvertedSchedules = badgerTreeDistributions.map((e) => ({
				token: e.token.id.startsWith('0x0x') ? e.token.id.slice(2) : e.token.id,
				amount: formatBalance(e.amount),
				start: e.timestamp,
				end: e.timestamp,
				beneficiary: this.vault!.vaultToken,
				compPercent: 100,
			}));
			this.emissionsSchedules = await this.bucketSchedules(treeSchedules.concat(harvestConvertedSchedules));
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

	private async bucketSchedules(schedules: EmissionSchedule[]): Promise<BveCvxEmissionRound[]> {
		const schedulesByRound: Record<number, EmissionSchedule[]> = {};

		for (let schedule of schedules) {
			let round = Math.ceil((schedule.start - ROUND_ONE_START) / (14 * (ONE_DAY_MS / 1000)));

			// we have some weird schedules that are bad entries
			if (round < 1) {
				continue;
			}

			if (!schedulesByRound[round]) {
				schedulesByRound[round] = [];
			}

			let maybeOverlap = schedulesByRound[round].find((e) => isOverlapping(e, schedule));

			while (maybeOverlap) {
				round += 1;

				if (!schedulesByRound[round]) {
					schedulesByRound[round] = [];
				}

				maybeOverlap = schedulesByRound[round].find((e) => isOverlapping(e, schedule));
			}

			schedulesByRound[round].push(schedule);
		}

		const baseObjects = Object.entries(schedulesByRound).map((e) => {
			const [round, schedules] = e;

			let totalBadger = 0;
			let totalBveCvx = 0;
			let totalBCvxCrv = 0;
			let start = Number.MAX_SAFE_INTEGER;

			for (let schedule of schedules) {
				const token = ethers.utils.getAddress(schedule.token);
				if (schedule.start < start) {
					start = schedule.start;
				}
				if (token === BADGER_TOKEN) {
					totalBadger += schedule.amount;
				}
				if (token === BVE_CVX_TOKEN) {
					totalBveCvx += schedule.amount;
				}
				if (token === BCVX_CRV_TOKEN) {
					totalBCvxCrv += schedule.amount;
				}
			}

			// set up objects with initial unused params - they will be filled in later
			return {
				badger: totalBadger,
				badgerValue: 0,
				bveCVX: totalBveCvx,
				bveCVXValue: 0,
				bcvxCrv: totalBCvxCrv,
				bcvxCrvValue: 0,

				vaultTokens: 0,
				vaultValue: 0,

				index: Number(round),
				start,
			};
		});

		const tokens = [BADGER_TOKEN, BVE_CVX_TOKEN, BCVX_CRV_TOKEN];
		const timestamps = baseObjects.map((o) => o.start * 1000);

		const [tokenPricesSnapshots, vaultSnapshots] = await Promise.all([
			this.store.sdk.api.loadPricesSnapshots(tokens, timestamps),
			this.store.sdk.api.loadVaultSnapshots(this.vault!.vaultToken, timestamps),
		]);

		const vaultSnapshotsByTimestamp = Object.fromEntries(vaultSnapshots.map((s) => [s.timestamp, s]));

		baseObjects.forEach((o) => {
			const timestamp = o.start * 1000;
			const badgerPrice = tokenPricesSnapshots[BADGER_TOKEN][timestamp];
			const bveCvxPrice = tokenPricesSnapshots[BVE_CVX_TOKEN][timestamp];
			const bcvxCrvPrice = tokenPricesSnapshots[BCVX_CRV_TOKEN][timestamp];
			o.badgerValue = o.badger * badgerPrice;
			o.bveCVXValue = o.bveCVX * bveCvxPrice;
			o.bcvxCrvValue = o.bcvxCrv * bcvxCrvPrice;

			const vaultSnapshot = vaultSnapshotsByTimestamp[timestamp];
			o.vaultTokens = vaultSnapshot.balance;
			o.vaultValue = vaultSnapshot.value;
		});

		return baseObjects;
	}
}

export default BveCvxInfluenceStore;
