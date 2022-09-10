import { ChartTimeFrame, ONE_DAY_SECONDS, ONE_YEAR_MS, VaultDTOV3, YieldEvent, YieldType } from '@badger-dao/sdk';
import { getInfluenceVaultConfig } from 'components-v2/InfluenceVault/InfluenceVaultUtil';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { extendObservable } from 'mobx';
import { EmissionRoundToken, GraphObject, InfluenceVaultEmissionRound } from 'mobx/model/charts/influence-vaults-graph';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { InfluenceVaultConfig, InfluenceVaultData } from 'mobx/model/vaults/influence-vault-data';

import { CurveFactoryPool__factory } from '../../contracts';
import { RootStore } from './RootStore';

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
        this.loadChartInfo(ChartTimeFrame.Week, vault),
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

  async loadChartInfo(timeframe: ChartTimeFrame, vault: VaultDTOV3) {
    try {
      this.influenceVaults[vault.vaultToken].processingChartData = true;
      this.influenceVaults[vault.vaultToken].vaultChartData = await this.store.vaultCharts.search(vault, timeframe);
    } catch (error) {
      console.error(error);
    } finally {
      this.influenceVaults[vault.vaultToken].processingChartData = false;
    }
  }

  async loadEmissionsSchedules(vault: VaultDTOV3) {
    const config = getInfluenceVaultConfig(vault.vaultToken);

    if (!this.influenceVaults[vault.vaultToken] || !config) {
      return;
    }

    try {
      const { roundStart } = config;
      const { api } = this.store;
      this.influenceVaults[vault.vaultToken].processingEmissions = true;

      // TODO: if we do not even bother showing rounds with emissions, should we include this?
      const emissionSchedules = await api.loadSchedule(vault.address, false);
      const yieldSchedules = emissionSchedules
        .filter((s) => s.start > roundStart)
        .map((s) => ({
          ...s,
          start: s.start * 1000,
          end: s.end * 1000,
        }))
        .filter((e) => e.start > 0);
      const timestamps = Array.from(new Set(yieldSchedules.map((e) => e.start)));
      const emissionTokens = Array.from(new Set(yieldSchedules.map((e) => e.token)));
      const [tokenPriceSnapshots, vaultSnapshots] = await Promise.all([
        this.store.sdk.api.loadPricesSnapshots(emissionTokens, timestamps),
        this.store.sdk.api.loadVaultSnapshots(vault.vaultToken, timestamps),
      ]);

      const vaultSnapshotsByTimestamp = Object.fromEntries(vaultSnapshots.map((s) => [s.timestamp, s]));

      // TODO: make this way fuckin easier, we could provide this with historic schedule data
      const emissionYieldEvents: YieldEvent[] = yieldSchedules
        .filter(({ start }) => vaultSnapshotsByTimestamp[start] !== undefined)
        .map(({ start, end, amount, token }) => {
          const { balance, value } = vaultSnapshotsByTimestamp[start];
          const price = tokenPriceSnapshots[token][start];
          const earned = amount * price;
          const duration = end - start;
          const apr = ((earned * (ONE_YEAR_MS / duration)) / value) * 100;
          const grossApr = apr;
          return {
            amount,
            apr,
            grossApr,
            balance,
            block: 0,
            earned,
            timestamp: start,
            token,
            // hmm, maybe we should add amother yield type... this is like SourceType anyway
            type: YieldType.Emission,
            value,
            tx: '',
          };
        });

      const yieldEvents = await api.loadVaultHarvestsV3(vault.address);
      const totalYieldEvents = yieldEvents.concat(emissionYieldEvents).filter((e) => e.timestamp >= roundStart * 1000);
      const bucketedEvents = await this.#bucketYieldEvents(totalYieldEvents, vault, config);

      this.influenceVaults[vault.vaultToken].emissionsSchedules = bucketedEvents;
    } catch (error) {
      console.error(error);
    } finally {
      this.influenceVaults[vault.vaultToken].processingEmissions = false;
    }
  }

  async loadSwapPercentage(vault: VaultDTOV3) {
    const config = getInfluenceVaultConfig(vault.vaultToken);
    const {
      sdk: { provider },
    } = this.store;
    if (this.influenceVaults[vault.vaultToken].swapPercentage !== '' || !config || !config.poolToken) {
      return;
    }
    const curvePool = CurveFactoryPool__factory.connect(config.poolToken, provider);
    const swapAmount = 10_000; // 10k bveCVX;
    // in the pool each token is represented by an index 0 is bveCVX and 1 is CVX
    // We might need to store this in config if ratio's change for other ivaults with curve pools.
    const estimatedSwap = await curvePool.get_dy(1, 0, parseUnits(String(swapAmount), 'ether'));
    const swap = Number(formatUnits(estimatedSwap, 'ether'));
    const percentage = swap / swapAmount;
    this.influenceVaults[vault.vaultToken].swapPercentage = `${(percentage * 100).toFixed(2)}%`;
  }

  async #bucketYieldEvents(
    events: YieldEvent[],
    vault: VaultDTOV3,
    config: InfluenceVaultConfig,
  ): Promise<InfluenceVaultEmissionRound[]> {
    const { roundStart, scheduleRoundCutoff, includeHarvests } = config;
    const eventsByRound: Record<number, YieldEvent[]> = {};

    for (const event of events) {
      // vaults such as bveCVX emit harvest events - they are not to be used!
      if (!includeHarvests && event.type === YieldType.Harvest) {
        continue;
      }

      const timeDifference = event.timestamp / 1000 - roundStart;
      let round = Math.ceil(timeDifference / (14 * ONE_DAY_SECONDS));

      // we have some weird schedules that are bad entries
      if (round < scheduleRoundCutoff) {
        continue;
      }

      if (!eventsByRound[round]) {
        eventsByRound[round] = [];
      }

      // event matches the pattern for incentives allocations per round
      if (
        event.type === YieldType.TreeDistribution &&
        (event.token === ETH_DEPLOY.token || event.token === vault.address)
      ) {
        let includedInRound = eventsByRound[round].some(
          (e) => e.type === YieldType.TreeDistribution && e.token === event.token,
        );
        while (includedInRound) {
          round--;
          includedInRound = eventsByRound[round].some(
            (e) => e.type === YieldType.TreeDistribution && e.token === event.token,
          );
        }
      }

      eventsByRound[round].push(event);
    }

    const allTokens = Array.from(new Set(Object.values(eventsByRound).flatMap((e) => e.map((e) => e.token))));

    const baseObjects = Object.entries(eventsByRound).map((e) => {
      const [round, events] = e;
      const tokenMap: Record<string, EmissionRoundToken> = Object.fromEntries(
        allTokens.map((t) => [
          t,
          {
            symbol: this.store.vaults.getToken(t).symbol,
            balance: 0,
            value: 0,
          },
        ]),
      );

      let start = Number.MAX_SAFE_INTEGER;
      let vaultTokens = 0;
      let vaultValue = 0;

      for (const event of events) {
        if (event.timestamp < start) {
          start = event.timestamp;
        }

        if (!tokenMap[event.token]) {
          tokenMap[event.token] = {
            symbol: this.store.vaults.getToken(event.token).symbol,
            balance: event.amount,
            value: event.earned,
          };
        } else {
          tokenMap[event.token].balance += event.amount;
          tokenMap[event.token].value += event.earned;
        }

        vaultTokens += event.balance;
        vaultValue += event.value;
      }

      vaultTokens /= events.length;
      vaultValue /= events.length;

      const graph: GraphObject = {};

      // really consider revisiting this setup... it is very confusing
      // nearly impossible to understand at this point
      return {
        tokens: Object.values(tokenMap),
        graph: graph,
        vaultTokens,
        vaultValue,

        index: Number(round),
        start,
        divisorTokenSymbol: this.store.vaults.getToken(vault.vaultToken).symbol,
      };
    });

    baseObjects.forEach((o) => {
      const valuePerHundred = o.vaultTokens / 100;
      o.tokens.forEach((_t, index) => {
        const value = o.tokens[index].value / valuePerHundred;
        o.tokens[index].value = value;
        o.graph[`${index}`] = value;
      });
    });

    return baseObjects;
  }
}

export default InfluenceVaultStore;
