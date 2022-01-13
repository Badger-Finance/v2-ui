import {
	getFormattedNetworkName,
	getUserVaultBoost,
	restrictToRange,
	roundWithDecimals,
} from '../../utils/componentHelpers';
import { Ethereum } from '../../mobx/model/network/eth.network';
import { BinanceSmartChain } from '../../mobx/model/network/bsc.network';
import { Arbitrum } from '../../mobx/model/network/arbitrum.network';
import { Polygon } from '../../mobx/model/network/matic.network';
import { Vault } from '@badger-dao/sdk';
import { BouncerType, Protocol, VaultState, VaultType } from '@badger-dao/sdk/lib/api/enums';

const mockVault: Vault = {
	name: 'Mock Vault',
	value: 100000,
	balance: 1000,
	asset: 'mock',
	vaultAsset: 'mock',
	boost: { enabled: false, weight: 0 },
	bouncer: BouncerType.None,
	apr: 10,
	newVault: false,
	pricePerFullShare: 1,
	protocol: Protocol.Badger,
	sources: [],
	state: VaultState.Experimental,
	tokens: [],
	underlyingToken: 'mock',
	vaultToken: 'mock',
	strategy: {
		address: '0x',
		withdrawFee: 0,
		performanceFee: 0,
		strategistFee: 0,
	},
	type: VaultType.Native,
};

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
			expect(roundWithDecimals(num, decimals)).toEqual(roundedValue);
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
			['with no boosted vault', 0, null, mockVault],
			['with deprecated vault', 0, null, { ...mockVault, state: VaultState.Deprecated }],
			[
				'with boosted vault',
				0.029492343980964595,
				0.000763468525864397,
				{
					...mockVault,
					minApr: 9.989946327010259,
					boost: { enabled: true, weight: 1 },
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
				},
			],
		])('getUserVaultBoost(%s, %d) returns %p', (_testCaseName, boost, calculatedBoost, vault) => {
			expect(getUserVaultBoost(vault, boost)).toEqual(calculatedBoost);
		});
	});
});
