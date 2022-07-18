import { RootStore } from '../RootStore';
import { VaultChartData, VaultChartTimeframe } from '../model/vaults/vault-charts';
import { computed, extendObservable } from 'mobx';
import { EmissionSchedule, formatBalance, ONE_DAY_MS, VaultDTO } from '@badger-dao/sdk';
import { CurveFactoryPool__factory } from '../../contracts';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { InfluenceVaultEmissionRound, EmissionRoundToken, GraphObject } from 'mobx/model/charts/influence-vaults-graph';
import { InfluenceVaultData } from 'mobx/model/vaults/influence-vault-data';
import { getInfluenceVaultConfig } from 'components-v2/InfluenceVault/InfluenceVaultUtil';

function isOverlapping(original: EmissionSchedule, other: EmissionSchedule): boolean {
	return original.token === other.token && Math.abs(original.start - other.start) > 14 * (ONE_DAY_MS / 1000);
}

class InfluenceVaultStore {
	private readonly store: RootStore;
	private influenceVaults: Record<string, InfluenceVaultData> = {};

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			influenceVaults: this.influenceVaults,
		});
	}

	async init(token: string) {
		const vault = this.store.vaults.getVault(token);
		this.influenceVaults[token] = {
			vault: vault,
			vaultChartData: null,
			emissionsSchedules: null,
			processingChartData: true,
			processingEmissions: true,
			swapPercentage: '',
		};
		if (vault !== undefined)
			await Promise.all([
				this.loadChartInfo(VaultChartTimeframe.Week, vault),
				this.loadEmissionsSchedules(vault),
				this.loadSwapPercentage(vault),
			]);
	}

	getInfluenceVault(address: string): InfluenceVaultData {
		if (this.influenceVaults[address] === undefined) {
			return {
				vault: this.store.vaults.getVault(address),
				vaultChartData: null,
				emissionsSchedules: null,
				processingChartData: true,
				processingEmissions: true,
				swapPercentage: '',
			};
		}
		return this.influenceVaults[address];
	}

	async loadChartInfo(timeframe: VaultChartTimeframe, vault: VaultDTO) {
		try {
			this.influenceVaults[vault.vaultToken].processingChartData = true;
			this.influenceVaults[vault.vaultToken].vaultChartData = await this.store.vaultCharts.search(
				vault,
				timeframe,
			);
		} catch (error) {
			console.error(error);
		} finally {
			this.influenceVaults[vault.vaultToken].processingChartData = false;
		}
	}

	async loadEmissionsSchedules(vault: VaultDTO) {
		if (!this.influenceVaults[vault.vaultToken]) return;
		try {
			this.influenceVaults[vault.vaultToken].processingEmissions = true;
			const treeSchedules = await this.store.sdk.api.loadSchedule(vault.vaultToken, false);
			const { badgerTreeDistributions } = await this.store.sdk.graph.loadBadgerTreeDistributions({
				where: {
					sett: vault.vaultToken.toLowerCase(),
				},
			});
			const harvestConvertedSchedules = badgerTreeDistributions.map((e) => ({
				token: e.token.id.startsWith('0x0x') ? e.token.id.slice(2) : e.token.id,
				amount: formatBalance(e.amount),
				start: e.timestamp,
				end: e.timestamp,
				beneficiary: vault!.vaultToken,
				compPercent: 100,
			}));
			this.influenceVaults[vault.vaultToken].emissionsSchedules = await this.bucketSchedules(
				treeSchedules.concat(harvestConvertedSchedules),
				vault,
			);
		} catch (error) {
			console.error(error);
		} finally {
			this.influenceVaults[vault.vaultToken].processingEmissions = false;
		}
	}

	async loadSwapPercentage(vault: VaultDTO) {
		const config = getInfluenceVaultConfig(vault.vaultToken);
		const { provider } = this.store.wallet;
		if (!provider || this.influenceVaults[vault.vaultToken].swapPercentage === '') return;
		const curvePool = CurveFactoryPool__factory.connect(config.poolToken, provider);
		const swapAmount = 10_000; // 10k bveCVX;
		// in the pool each token is represented by an index 0 is bveCVX and 1 is CVX
		// We might need to store this in config if ratio's change for other ivaults with curve pools.
		const estimatedSwap = await curvePool.get_dy(1, 0, parseUnits(String(swapAmount), 'ether'));
		const swap = Number(formatUnits(estimatedSwap, 'ether'));
		const percentage = swap / swapAmount;
		this.influenceVaults[vault.vaultToken].swapPercentage = `${(percentage * 100).toFixed(2)}%`;
	}

	private async bucketSchedules(
		schedules: EmissionSchedule[],
		vault: VaultDTO,
	): Promise<InfluenceVaultEmissionRound[]> {
		const schedulesByRound: Record<number, EmissionSchedule[]> = {};
		const config = getInfluenceVaultConfig(vault.vaultToken);
		const sourceTokens = config.sources;
		for (let schedule of schedules) {
			let round = Math.ceil((schedule.start - config.roundStart) / (14 * (ONE_DAY_MS / 1000)));

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

			let tokens: EmissionRoundToken[] = sourceTokens.map((token: string) => ({
				symbol: this.store.vaults.getToken(token).symbol,
				balance: 0,
				value: 0,
			}));

			let start = Number.MAX_SAFE_INTEGER;

			for (let schedule of schedules) {
				const token = ethers.utils.getAddress(schedule.token);
				if (schedule.start < start) {
					start = schedule.start;
				}
				sourceTokens.forEach((sourceToken: string, index: number) => {
					if (sourceToken === token) {
						tokens[index].balance += schedule.amount;
					}
				});
			}

			let graph: GraphObject = {};

			// set up objects with initial unused params - they will be filled in later
			return {
				tokens: tokens,
				graph: graph,
				vaultTokens: 0,
				vaultValue: 0,

				index: Number(round),
				start,
				diviserTokenSymbol: this.store.vaults.getToken(vault.vaultToken).symbol,
			};
		});

		const timestamps = baseObjects.map((o) => o.start * 1000);

		const [tokenPricesSnapshots, vaultSnapshots] = await Promise.all([
			this.store.sdk.api.loadPricesSnapshots(sourceTokens, timestamps),
			this.store.sdk.api.loadVaultSnapshots(vault.vaultToken, timestamps),
		]);

		const vaultSnapshotsByTimestamp = Object.fromEntries(vaultSnapshots.map((s) => [s.timestamp, s]));

		baseObjects.forEach((o) => {
			const timestamp = o.start * 1000;

			const vaultSnapshot = vaultSnapshotsByTimestamp[timestamp];
			o.vaultTokens = vaultSnapshot.balance;
			o.vaultValue = vaultSnapshot.value;

			const valuePerHundred = vaultSnapshot.balance / 100;
			sourceTokens.forEach((sourceToken: string, index: number) => {
				const value =
					(o.tokens[index].balance * tokenPricesSnapshots[sourceToken][timestamp]) / valuePerHundred;
				o.tokens[index].value = value;
				o.graph[`${index}`] = value;
			});
		});
		return baseObjects;
	}
}

export default InfluenceVaultStore;