import React from 'react';
import Landing from '../pages/Landing';
import '@testing-library/jest-dom';
import store from '../mobx/RootStore';
import { checkSnapshot } from './utils/snapshots';
import BigNumber from 'bignumber.js';
import UserStore from 'mobx/stores/UserStore';
import { createMatchMedia } from './Utils';
import VaultStore from '../mobx/stores/VaultStore';
import { BouncerType, Protocol, VaultState, VaultType } from '@badger-dao/sdk';

const mockLandingVaults = [
	{
		type: VaultType.Standard,
		apr: 12.1488615485636,
		asset: 'DIGG',
		available: 473.60121685437,
		balance: 230.614422202,
		newVault: false,
		boost: {
			enabled: false,
			weight: 0,
		},
		bouncer: BouncerType.None,
		name: 'Digg',
		protocol: Protocol.Badger,
		pricePerFullShare: 0.185509641256659,
		vaultAsset: 'bDIGG',
		vaultToken: '0x7e7E112A68d8D2E221E11047a72fFC1065c38e1a',
		sources: [
			{
				apr: 12.1488615485636,
				boostable: false,
				harvestable: false,
				maxApr: 12.1488615485636,
				minApr: 12.1488615485636,
				name: 'Vault Compounding',
				performance: {
					oneDay: 7.21563318444512e-7,
					sevenDay: 5.2213108711974,
					thirtyDay: 7.89352024756005,
					threeDay: 12.1488615485636,
				},
			},
		],
		state: VaultState.Open,
		strategy: {
			address: '0x4a8651F2edD68850B944AD93f2c67af817F39F62',
			performanceFee: 0,
			strategistFee: 0,
			withdrawFee: 0,
		},
		tokens: [
			{
				address: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
				balance: 230.614422202,
				decimals: 9,
				name: 'Digg',
				symbol: 'DIGG',
				value: 14816575.9133979,
			},
		],
		underlyingToken: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
		value: 14816575.9133979,
	},
	{
		type: VaultType.Standard,
		apr: 177.284923726919,
		asset: 'imBTC',
		available: 473.60121685437,
		balance: 362.480168846736,
		newVault: false,
		boost: {
			enabled: false,
			weight: 0,
		},
		bouncer: BouncerType.None,
		maxApr: 508.539177602329,
		minApr: 10.4106515472177,
		name: 'mStable imBTC',
		protocol: Protocol.mStable,
		pricePerFullShare: 1.00092006793112,
		vaultAsset: 'bimBTC',
		vaultToken: '0x599D92B453C010b1050d31C364f6ee17E819f193',
		sources: [
			{
				apr: 1.78333333333333,
				boostable: false,
				harvestable: false,
				maxApr: 1.78333333333333,
				minApr: 1.78333333333333,
				name: 'mBTC Native Yield',
				performance: {
					oneDay: 2.92,
					sevenDay: 4.89571428571429,
					thirtyDay: 2.173,
					threeDay: 1.78333333333333,
				},
			},
		],
		state: VaultState.Open,
		strategy: {
			address: '0xd409C506742b7f76f164909025Ab29A47e06d30A',
			performanceFee: 1000,
			strategistFee: 0,
			withdrawFee: 50,
		},
		tokens: [
			{
				address: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24',
				balance: 362.480168846736,
				decimals: 18,
				name: 'imBTC',
				symbol: 'imBTC',
				value: 2273681.99036851,
			},
		],
		underlyingToken: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24',
		value: 2273681.99036851,
	},
	{
		type: VaultType.Standard,
		apr: 2.65777115288197,
		asset: 'WBTC',
		available: 473.60121685437,
		balance: 1914.31703991,
		boost: {
			enabled: false,
			weight: 0,
		},
		bouncer: BouncerType.None,
		maxApr: 27.0341237265744,
		minApr: 0.0319584853973294,
		newVault: false,
		name: 'Yearn Wrapped BTC',
		protocol: Protocol.Yearn,
		pricePerFullShare: 1.01477693,
		vaultAsset: 'bvyWBTC',
		vaultToken: '0x4b92d19c11435614CD49Af1b589001b7c08cD4D5',
		sources: [
			{
				apr: 0.0184506488584714,
				boostable: false,
				harvestable: false,
				maxApr: 0.0184506488584714,
				minApr: 0.0184506488584714,
				name: 'Vault Compounding',
				performance: {
					oneDay: 0,
					sevenDay: 0.0184506488584714,
					thirtyDay: 2.09696890694594,
					threeDay: 0.00562043322335649,
				},
			},
		],
		state: VaultState.Open,
		strategy: {
			address: '0x0000000000000000000000000000000000000000',
			performanceFee: 0,
			strategistFee: 0,
			withdrawFee: 0,
		},
		tokens: [
			{
				address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				balance: 1914.31703991,
				decimals: 8,
				name: 'Wrapped Bitcoin',
				symbol: 'WBTC',
				value: 116901598.676184,
			},
		],
		underlyingToken: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
		value: 116901598.676184,
	},
	{
		type: VaultType.Standard,
		apr: 8.02482905107376,
		asset: 'SLP-WBTC-ETH',
		available: 473.60121685437,
		balance: 0.000544739337494635,
		newVault: false,
		boost: {
			enabled: false,
			weight: 0,
		},
		bouncer: BouncerType.None,
		maxApr: 50.1473134416141,
		minApr: 4.32136835437553,
		protocol: Protocol.Sushiswap,
		name: 'Sushiswap Wrapped BTC/Wrapped ETH',
		pricePerFullShare: 1,
		vaultAsset: 'bSLP-WBTC-ETH',
		vaultToken: '0x758A43EE2BFf8230eeb784879CdcFF4828F2544D',
		sources: [
			{
				apr: 2.91403809508507,
				boostable: false,
				harvestable: false,
				maxApr: 2.91403809508507,
				minApr: 2.91403809508507,
				name: 'Sushiswap LP Fees',
				performance: {
					oneDay: 0.0343857405445953,
					sevenDay: 3.34009497195786,
					thirtyDay: 3.07016785774198,
					threeDay: 2.91403809508507,
				},
			},
		],
		state: VaultState.Open,
		strategy: {
			address: '0x7A56d65254705B4Def63c68488C0182968C452ce',
			performanceFee: 1000,
			strategistFee: 1000,
			withdrawFee: 50,
		},
		tokens: [
			{
				address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				balance: 340.374364807103,
				decimals: 8,
				name: 'Wrapped Bitcoin',
				symbol: 'WBTC',
				value: 20759772.88395,
			},
			{
				address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
				balance: 5202.03519780644,
				decimals: 18,
				name: 'Wrapped Ethereum',
				symbol: 'WETH',
				value: 20699626.3369995,
			},
		],
		underlyingToken: '0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58',
		value: 41459399.2209495,
	},
	{
		type: VaultType.Standard,
		apr: 278.946597358605,
		asset: 'BADGER-WBTC',
		available: 473.60121685437,
		balance: 0.0378818139342264,
		boost: {
			enabled: false,
			weight: 0,
		},
		bouncer: BouncerType.None,
		name: 'Uniswap Wrapped BTC/Badger',
		newVault: false,
		protocol: Protocol.Badger,
		pricePerFullShare: 1.78903561415214,
		vaultAsset: 'bBADGER-WBTC',
		vaultToken: '0x235c9e24D3FB2FAFd58a2E49D454Fdcd2DBf7FF1',
		sources: [
			{
				apr: 251.828239904931,
				boostable: false,
				harvestable: false,
				maxApr: 251.828239904931,
				minApr: 251.828239904931,
				name: 'Vault Compounding',
				performance: {
					oneDay: 4.56740011020613e-12,
					sevenDay: 107.825318608721,
					thirtyDay: 44.9880784180579,
					threeDay: 251.828239904931,
				},
			},
		],
		state: VaultState.Open,
		strategy: {
			address: '0x95826C65EB1f2d2F0EDBb7EcB176563B61C60bBf',
			performanceFee: 0,
			strategistFee: 0,
			withdrawFee: 0,
		},
		tokens: [
			{
				address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				balance: 93.0083736291135,
				decimals: 8,
				name: 'Wrapped Bitcoin',
				symbol: 'WBTC',
				value: 5672673.71601326,
			},
			{
				address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
				balance: 215419.846865782,
				decimals: 18,
				name: 'Badger',
				symbol: 'BADGER',
				value: 5663387.7741014,
			},
		],
		underlyingToken: '0xcD7989894bc033581532D2cd88Da5db0A4b12859',
		value: 11336061.4901147,
	},
	{
		type: VaultType.Standard,
		apr: 0,
		asset: 'BADGER',
		available: 473.60121685437,
		balance: 3207364.24255943,
		newVault: false,
		boost: {
			enabled: false,
			weight: 0,
		},
		bouncer: BouncerType.None,
		name: 'Badger',
		protocol: Protocol.Badger,
		pricePerFullShare: 1.23488168867635,
		vaultAsset: 'bBADGER',
		vaultToken: '0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28',
		sources: [],
		state: VaultState.Open,
		strategy: {
			address: '0x75b8E21BD623012Efb3b69E1B562465A68944eE6',
			performanceFee: 0,
			strategistFee: 0,
			withdrawFee: 0,
		},
		tokens: [
			{
				address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
				balance: 3207364.24255943,
				decimals: 18,
				name: 'Badger',
				symbol: 'BADGER',
				value: 84514047.791441,
			},
		],
		underlyingToken: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
		value: 84514047.791441,
	},
	{
		type: VaultType.Standard,
		apr: 1.28046491065017,
		asset: 'crvrenWBTC',
		available: 473.60121685437,
		balance: 473.60121685437,
		boost: {
			enabled: false,
			weight: 0,
		},
		bouncer: BouncerType.None,
		name: 'Harvest renBTC/wBTC',
		protocol: Protocol.Curve,
		newVault: false,
		pricePerFullShare: 1.02100568616584,
		vaultAsset: 'bcrvhrenBTC',
		vaultToken: '0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87',
		sources: [
			{
				apr: 1.20104996179789,
				boostable: false,
				harvestable: false,
				maxApr: 1.20104996179789,
				minApr: 1.20104996179789,
				name: 'Vault Compounding',
				performance: {
					oneDay: 0,
					sevenDay: 1.72972434764268,
					thirtyDay: 2.43163495085954,
					threeDay: 1.20104996179789,
				},
			},
		],
		state: VaultState.Open,
		strategy: {
			address: '0xaaE82E3c89e15E6F26F60724f115d5012363e030',
			performanceFee: 0,
			strategistFee: 0,
			withdrawFee: 50,
		},
		tokens: [
			{
				address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
				balance: 373.712252499345,
				decimals: 8,
				name: 'Ren Protocol BTC',
				symbol: 'renBTC',
				value: 22765429.2855026,
			},
			{
				address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				balance: 108.468993277959,
				decimals: 8,
				name: 'Wrapped Bitcoin',
				symbol: 'WBTC',
				value: 6615632.36901602,
			},
		],
		underlyingToken: '0x49849C98ae39Fff122806C06791Fa73784FB3675',
		value: 29381061.6545186,
	},
];

describe('Landing', () => {
	beforeEach(() => {
		store.prices.getPrice = jest.fn().mockReturnValue(new BigNumber(15e18));
		store.network.network.deploy.token = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
		store.onboard.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		store.user.accountDetails = {
			address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
			value: 0,
			earnedValue: 0,
			data: {},
			boost: 1,
			boostRank: 251,
			multipliers: {
				'0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': 1,
			},
			nativeBalance: 100,
			nonNativeBalance: 10,
			stakeRatio: 100,
			claimableBalances: {},
			nftBalance: 0,
		};

		jest.spyOn(UserStore.prototype, 'initialized', 'get').mockReturnValue(true);
		jest.spyOn(UserStore.prototype, 'portfolioValue', 'get').mockReturnValue(new BigNumber(1000));
		jest.spyOn(VaultStore.prototype, 'getVaultOrder').mockReturnValue(mockLandingVaults);

		jest.spyOn(VaultStore.prototype, 'vaultsDefinitions', 'get').mockReturnValue(
			new Map(
				mockLandingVaults.map((vault) => [
					vault.vaultToken,
					{
						depositToken: { address: vault.underlyingToken, decimals: 18 },
						vaultToken: { address: vault.vaultToken, decimals: 18 },
					},
				]),
			),
		);
	});

	test('Renders correctly', async () => {
		checkSnapshot(<Landing title="Test Bitcoin Strategies" subtitle="Snapshots are great. Landing looks good." />);
	});

	test('Renders tablet version correctly', () => {
		window.matchMedia = createMatchMedia(900);
		checkSnapshot(<Landing title="Test Bitcoin Strategies" subtitle="Snapshots are great. Landing looks good." />);
	});

	test('Renders mobile version correctly', () => {
		window.matchMedia = createMatchMedia(480);
		checkSnapshot(<Landing title="Test Bitcoin Strategies" subtitle="Snapshots are great. Landing looks good." />);
	});
});
