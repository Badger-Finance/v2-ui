import { VaultState } from '@badger-dao/sdk';
import { SAMPLE_VAULT } from 'tests/utils/samples';
import { BoostedRewards } from 'utils/enums/boosted-rewards.enum';

import { Arbitrum } from '../../mobx/model/network/arbitrum.network';
import { BinanceSmartChain } from '../../mobx/model/network/bsc.network';
import { Ethereum } from '../../mobx/model/network/eth.network';
import { Polygon } from '../../mobx/model/network/matic.network';
import {
  getFormattedNetworkName,
  getUserVaultBoost,
  isBadgerSource,
  restrictToRange,
  roundWithPrecision,
} from '../../utils/componentHelpers';

describe('Component Helpers', () => {
  describe('isBadgerSource', () => {
    it.each([
      [{ name: 'Not A Badger Source' }, false],
      [{ name: BoostedRewards.Badger }, true],
      [{ name: BoostedRewards.BoostedBadger }, true],
    ])('Evaluates %s as %s', (source, result) => {
      expect(isBadgerSource(source)).toEqual(result);
    });
  });

  describe('restrictToRange', () => {
    test.each([
      [100, 10, 20, 20],
      [Infinity, 1231, 20222, 20222],
      [0, 100, 210, 100],
      [-Infinity, 0, 100, 0],
    ])('restrictToRange(%f,%f,%f) returns %f', (val, min, max, restiricetedValue) => {
      expect(restrictToRange(val, min, max)).toEqual(restiricetedValue);
    });
  });

  describe('roundWithDecimals', () => {
    test.each([
      [12.1322, 1, 12.1],
      [100.123121, 2, 100.12],
      [81.6712, 3, 81.671],
    ])('roundWithDecimals(%f,%f,%f) returns %f', (num, decimals, roundedValue) => {
      expect(roundWithPrecision(num, decimals)).toEqual(roundedValue);
    });
  });

  describe('getFormattedNetworkName', () => {
    test.each([
      [new Ethereum(), 'Ethereum'],
      [new BinanceSmartChain(), 'Binance Smart Chain'],
      [new Arbitrum(), 'Arbitrum'],
      [new Polygon(), 'Polygon'],
    ])('getFormattedNetworkName(%s) returns %s', (network, networkName) => {
      expect(getFormattedNetworkName(network)).toEqual(networkName);
    });
  });

  describe('getUserVaultBoost', () => {
    test.each([
      ['with deprecated vault', 0, 0, { ...SAMPLE_VAULT, state: VaultState.Discontinued }],
      [
        'with non deprecated vault',
        3000,
        11.2,
        {
          ...SAMPLE_VAULT,
          state: VaultState.Open,
          apy: {
            baseYield: 7.2,
            minYield: 3.2,
            maxYield: 11.2,
            grossYield: 7.2,
            minGrossYield: 3.2,
            maxGrossYield: 11.2,
            sources: [
              {
                id: 'ethereum-0x5dce29e92b1b939f8e8c60dcf15bde82a85be4a9_lp_fee_curve_lp_fees_flat',
                chainAddress: 'ethereum-0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9',
                chain: 'ethereum',
                address: '0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9',
                type: 'lp_fee',
                name: 'Curve LP Fees',
                boostable: false,
                performance: {
                  baseYield: 0.3,
                  grossYield: 0.3,
                  minYield: 0.3,
                  maxYield: 0.3,
                  minGrossYield: 0.3,
                  maxGrossYield: 0.3,
                },
              },
              {
                id: 'ethereum-0x5dce29e92b1b939f8e8c60dcf15bde82a85be4a9_lp_fee_curve_lp_fees_flat',
                chainAddress: 'ethereum-0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9',
                chain: 'ethereum',
                address: '0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9',
                type: 'lp_fee',
                name: 'Boosted Badger',
                boostable: true,
                performance: {
                  baseYield: 6.3,
                  grossYield: 6.3,
                  minYield: 2.3,
                  maxYield: 10.3,
                  minGrossYield: 2.3,
                  maxGrossYield: 10.3,
                },
              },
              {
                id: 'ethereum-0x5dce29e92b1b939f8e8c60dcf15bde82a85be4a9_lp_fee_curve_lp_fees_flat',
                chainAddress: 'ethereum-0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9',
                chain: 'ethereum',
                address: '0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9',
                type: 'lp_fee',
                name: 'bveCVX Rewards',
                boostable: false,
                performance: {
                  baseYield: 0.6,
                  grossYield: 0.6,
                  minYield: 0.6,
                  maxYield: 0.6,
                  minGrossYield: 0.6,
                  maxGrossYield: 0.6,
                },
              },
            ],
          },
        },
      ],
    ])('getUserVaultBoost(%s, %d) returns %p', (_testCaseName, boost, calculatedBoost, vault) => {
      expect(getUserVaultBoost(vault, boost).toFixed(5)).toEqual(calculatedBoost.toFixed(5));
    });
  });
});
