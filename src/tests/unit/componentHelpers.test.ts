import { VaultState } from '@badger-dao/sdk';
import { SAMPLE_VAULT } from 'tests/utils/samples';

import { Arbitrum } from '../../mobx/model/network/arbitrum.network';
import { BinanceSmartChain } from '../../mobx/model/network/bsc.network';
import { Ethereum } from '../../mobx/model/network/eth.network';
import { Polygon } from '../../mobx/model/network/matic.network';
import {
	getFormattedNetworkName,
	getUserVaultBoost,
	restrictToRange,
	roundWithPrecision,
} from '../../utils/componentHelpers';

describe('Component Helpers', () => {
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
				0.0294,
				9.99045,
				{
					...SAMPLE_VAULT,
					sources: [
						{
							name: 'Curve LP Fees',
							apr: 0.05479339317947084,
							boostable: false,
							harvestable: false,
							performance: {
								oneDay: 0.05479339317947084,
								threeDay: 0.05479339317947084,
								sevenDay: 0.05479339317947084,
								thirtyDay: 0.05479339317947084,
							},
							minApr: 0.05479339317947084,
							maxApr: 0.05479339317947084,
						},
						{
							name: 'bCVXCRV Rewards',
							apr: 4.080108258506518,
							boostable: false,
							harvestable: false,
							performance: {
								oneDay: 4.080108258506518,
								threeDay: 4.080108258506518,
								sevenDay: 4.080108258506518,
								thirtyDay: 4.080108258506518,
							},
							minApr: 4.080108258506518,
							maxApr: 4.080108258506518,
						},
						{
							name: 'Boosted Badger Rewards',
							apr: 9.655727302808833,
							boostable: true,
							harvestable: false,
							performance: {
								oneDay: 0.025899957344322835,
								threeDay: 0.025899957344322835,
								sevenDay: 0.025899957344322835,
								thirtyDay: 0.025899957344322835,
							},
							minApr: 0.025899957344322835,
							maxApr: 51.79991468864567,
						},
						{
							name: 'bveCVX Rewards',
							apr: 5.829144717979947,
							boostable: false,
							harvestable: false,
							performance: {
								oneDay: 5.829144717979947,
								threeDay: 5.829144717979947,
								sevenDay: 5.829144717979947,
								thirtyDay: 5.829144717979947,
							},
							minApr: 5.829144717979947,
							maxApr: 5.829144717979947,
						},
					],
					sourcesApy: [
						{
							name: 'Curve LP Fees',
							apr: 0.05479339317947084,
							boostable: false,
							harvestable: false,
							performance: {
								oneDay: 0.05479339317947084,
								threeDay: 0.05479339317947084,
								sevenDay: 0.05479339317947084,
								thirtyDay: 0.05479339317947084,
							},
							minApr: 0.05479339317947084,
							maxApr: 0.05479339317947084,
						},
						{
							name: 'bCVXCRV Rewards',
							apr: 4.080108258506518,
							boostable: false,
							harvestable: false,
							performance: {
								oneDay: 4.080108258506518,
								threeDay: 4.080108258506518,
								sevenDay: 4.080108258506518,
								thirtyDay: 4.080108258506518,
							},
							minApr: 4.080108258506518,
							maxApr: 4.080108258506518,
						},
						{
							name: 'Boosted Badger Rewards',
							apr: 9.655727302808833,
							boostable: true,
							harvestable: false,
							performance: {
								oneDay: 0.025899957344322835,
								threeDay: 0.025899957344322835,
								sevenDay: 0.025899957344322835,
								thirtyDay: 0.025899957344322835,
							},
							minApr: 0.025899957344322835,
							maxApr: 51.79991468864567,
						},
						{
							name: 'bveCVX Rewards',
							apr: 5.829144717979947,
							boostable: false,
							harvestable: false,
							performance: {
								oneDay: 5.829144717979947,
								threeDay: 5.829144717979947,
								sevenDay: 5.829144717979947,
								thirtyDay: 5.829144717979947,
							},
							minApr: 5.829144717979947,
							maxApr: 5.829144717979947,
						},
					],
				},
			],
		])('getUserVaultBoost(%s, %d) returns %p', (_testCaseName, boost, calculatedBoost, vault) => {
			expect(getUserVaultBoost(vault, boost).toFixed(5)).toEqual(calculatedBoost.toFixed(5));
		});
	});
});
