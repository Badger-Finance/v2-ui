import React from 'react';
import store from '../../mobx/RootStore';
import { StoreProvider } from '../../mobx/store-context';
import { BouncerType, Protocol, Vault, VaultState, VaultType } from '@badger-dao/sdk';
import { ExchangeRates } from '../../mobx/model/system-config/exchange-rates';
import { customRender, fireEvent, screen } from '../Utils';
import VaultListDisplay from '../../components-v2/landing/VaultListDisplay';
import { defaultNetwork } from '../../config/networks.config';
import { Currency } from '../../config/enums/currency.enum';
import UserStore from '../../mobx/stores/UserStore';
import { BalanceNamespace } from '../../web3/config/namespaces';
import { BadgerVault } from '../../mobx/model/vaults/badger-vault';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';

const sampleVaults: Vault[] = [
	{
		name: 'ibBTC / crvsBTC LP',
		newVault: true,
		asset: 'crvibBTC',
		vaultAsset: 'bcrvibBTC',
		state: VaultState.Open,
		underlyingToken: '0xFbdCA68601f835b27790D98bbb8eC7f05FDEaA9B',
		vaultToken: '0xaE96fF08771a109dc6650a1BdCa62F2d558E40af',
		value: 41931.75180585348,
		balance: 3178.06787828893,
		protocol: Protocol.Convex,
		pricePerFullShare: 1,
		tokens: [
			{
				value: 20094.268952577364,
				address: '0x8751D4196027d4e6DA63716fA7786B5174F04C15',
				name: 'wibBTC',
				symbol: 'wibBTC',
				decimals: 18,
				balance: 1498.3866834755574,
			},
			{
				value: 21837.482853276113,
				address: '0x000000000000000000000000000000000000000175b1bb99792c9E1041bA13afEf80C91a1e70fB3',
				name: 'Curve.fi renBTC/wBTC/sBTC',
				symbol: 'crvsBTC',
				decimals: 18,
				balance: 1666.1554813267362,
			},
		],
		apr: 19.16862206903562,
		boost: {
			enabled: true,
			weight: 10000,
		},
		minApr: 9.461123356709754,
		maxApr: 61.652732126597286,
		sources: [
			{
				name: 'Curve LP Fees',
				apr: 0.05773875239807311,
				boostable: false,
				harvestable: false,
				performance: {
					oneDay: 0.05773875239807311,
					threeDay: 0.05773875239807311,
					sevenDay: 0.05773875239807311,
					thirtyDay: 0.05773875239807311,
				},
				minApr: 0.05773875239807311,
				maxApr: 0.05773875239807311,
			},
			{
				name: 'bCVXCRV Rewards',
				apr: 3.6637832355582183,
				boostable: false,
				harvestable: false,
				performance: {
					oneDay: 3.6637832355582183,
					threeDay: 3.6637832355582183,
					sevenDay: 3.6637832355582183,
					thirtyDay: 3.6637832355582183,
				},
				minApr: 3.6637832355582183,
				maxApr: 3.6637832355582183,
			},
			{
				name: 'Boosted Badger Rewards',
				apr: 9.733607571140217,
				boostable: true,
				harvestable: false,
				performance: {
					oneDay: 9.733607571140217,
					threeDay: 9.733607571140217,
					sevenDay: 9.733607571140217,
					thirtyDay: 9.733607571140217,
				},
				minApr: 0.02610885881435094,
				maxApr: 52.217717628701884,
			},
			{
				name: 'bveCVX Rewards',
				apr: 5.713492509939111,
				boostable: false,
				harvestable: false,
				performance: {
					oneDay: 5.713492509939111,
					threeDay: 5.713492509939111,
					sevenDay: 5.713492509939111,
					thirtyDay: 5.713492509939111,
				},
				minApr: 5.713492509939111,
				maxApr: 5.713492509939111,
			},
		],
		bouncer: BouncerType.None,
		strategy: {
			address: '0x6D4BA00Fd7BB73b5aa5b3D6180c6f1B0c89f70D1',
			withdrawFee: 10,
			performanceFee: 2000,
			strategistFee: 0,
		},
		type: VaultType.Boosted,
	},
	{
		name: 'Badger',
		newVault: false,
		asset: 'Badger',
		vaultAsset: 'bBadger',
		state: VaultState.Open,
		underlyingToken: '0x0000000000000000000000000000000000000001',
		vaultToken: '0x0000000000000000000000000000000000000001',
		value: 10000,
		balance: 100,
		protocol: Protocol.Badger,
		pricePerFullShare: 0.18907615705168573,
		tokens: [
			{
				address: '0x0000000000000000000000000000000000000001',
				name: 'Badger',
				symbol: 'BADGER',
				decimals: 10,
				balance: 100,
				value: 10000,
			},
		],
		apr: 8.174287821972374,
		boost: {
			enabled: false,
			weight: 0,
		},
		sources: [
			{
				name: 'Vault Compounding',
				apr: 8.174287821972374,
				boostable: false,
				harvestable: false,
				performance: {
					oneDay: 0,
					threeDay: 2.5464786033167146e-7,
					sevenDay: 3.344828765174996e-7,
					thirtyDay: 8.174287821972374,
				},
				minApr: 8.174287821972374,
				maxApr: 8.174287821972374,
			},
		],
		bouncer: BouncerType.None,
		strategy: {
			address: '0x4a8651F2edD68850B944AD93f2c67af817F39F62',
			withdrawFee: 0,
			performanceFee: 0,
			strategistFee: 0,
		},
		type: VaultType.Native,
	},
	{
		name: 'Digg',
		newVault: false,
		asset: 'DIGG',
		vaultAsset: 'bDIGG',
		state: VaultState.Open,
		underlyingToken: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
		vaultToken: '0x7e7E112A68d8D2E221E11047a72fFC1065c38e1a',
		value: 2873.538729634401,
		balance: 237.567564646,
		protocol: Protocol.Badger,
		pricePerFullShare: 0.18907615705168573,
		tokens: [
			{
				address: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
				name: 'Digg',
				symbol: 'DIGG',
				decimals: 9,
				balance: 237.567564646,
				value: 2873.538729634401,
			},
		],
		apr: 8.174287821972374,
		boost: {
			enabled: false,
			weight: 0,
		},
		sources: [
			{
				name: 'Vault Compounding',
				apr: 8.174287821972374,
				boostable: false,
				harvestable: false,
				performance: {
					oneDay: 0,
					threeDay: 2.5464786033167146e-7,
					sevenDay: 3.344828765174996e-7,
					thirtyDay: 8.174287821972374,
				},
				minApr: 8.174287821972374,
				maxApr: 8.174287821972374,
			},
		],
		bouncer: BouncerType.None,
		strategy: {
			address: '0x4a8651F2edD68850B944AD93f2c67af817F39F62',
			withdrawFee: 0,
			performanceFee: 0,
			strategistFee: 0,
		},
		type: VaultType.Standard,
	},
];

const sampleExchangeRates: ExchangeRates = {
	usd: 3371.56,
	cad: 4215.55,
	btc: 0.07670423,
	bnb: 6.915813,
	matic: 1423.994304022784,
	xdai: 1,
};

describe('VaultListDisplay', () => {
	beforeEach(() => {
		jest.spyOn(defaultNetwork, 'settOrder', 'get').mockReturnValue(sampleVaults.map((vault) => vault.vaultToken));
		Object.defineProperty(defaultNetwork, 'vaults', {
			value: sampleVaults.map((vault) => ({
				depositToken: { address: vault.underlyingToken, decimals: 18 },
				vaultToken: { address: vault.vaultToken, decimals: 18 },
			})),
		});
		store.prices.exchangeRates = sampleExchangeRates;
		store.vaults.getVaultMap = jest
			.fn()
			.mockReturnValue(Object.fromEntries(sampleVaults.map((vault) => [vault.vaultToken, vault])));
	});

	afterEach(() => {
		jest.restoreAllMocks();
		store.vaults.clearFilters();
	});

	it('can clear dust from portfolio', () => {
		const emptyBalance = new TokenBalance(
			{
				address: sampleVaults[0].vaultToken,
				decimals: 18,
				name: 'test',
				symbol: 'test',
			},
			new BigNumber(0),
			new BigNumber(1),
		);

		const dustBalance = new TokenBalance(
			{
				address: sampleVaults[0].vaultToken,
				decimals: 18,
				name: 'test',
				symbol: 'test',
			},
			new BigNumber(0.0001 * 1e18),
			new BigNumber(1),
		);

		// return dust balance for first vault

		jest.spyOn(UserStore.prototype, 'getBalance').mockImplementation(
			(_namespace: BalanceNamespace, vault: BadgerVault) => {
				if (vault.vaultToken.address === sampleVaults[0].vaultToken) {
					return dustBalance;
				}

				return emptyBalance;
			},
		);

		jest.spyOn(UserStore.prototype, 'getTokenBalance').mockImplementation((address: string) => {
			if (address === sampleVaults[0].vaultToken) {
				return dustBalance;
			}

			return emptyBalance;
		});

		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay state={VaultState.Open} />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByLabelText('Open Vaults Filters'));
		fireEvent.click(screen.getByLabelText('hide portfolio dust'));
		fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
		expect(container).toMatchSnapshot();
	});

	it('can change currency', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay state={VaultState.Open} />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByLabelText('Open Vaults Filters'));
		fireEvent.click(screen.getByRole('radio', { name: Currency.BTC }));
		fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
		expect(container).toMatchSnapshot();
	});

	it('can apply protocol filters', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay state={VaultState.Open} />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByLabelText('Open Vaults Filters'));
		fireEvent.click(screen.getByRole('checkbox', { name: Protocol.Convex }));
		fireEvent.click(screen.getByRole('checkbox', { name: Protocol.Badger }));
		fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

		expect(container).toMatchSnapshot();
	});

	it('can apply token type filters', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay state={VaultState.Open} />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByLabelText('Open Vaults Filters'));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Boosted Tokens' }));
		fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

		expect(container).toMatchSnapshot();
	});

	it('can clear filters', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay state={VaultState.Open} />
			</StoreProvider>,
		);

		// apply filters then remove them
		fireEvent.click(screen.getByLabelText('Open Vaults Filters'));
		fireEvent.click(screen.getByRole('checkbox', { name: 'BadgerDAO Tokens' }));
		fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
		fireEvent.click(screen.getByLabelText('Open Vaults Filters'));
		fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));
		fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

		expect(container).toMatchSnapshot();
	});

	it('displays empty search message', () => {
		const vaults = sampleVaults.splice(1, 2);

		jest.spyOn(defaultNetwork, 'settOrder', 'get').mockReturnValue(vaults.map((vault) => vault.vaultToken));

		Object.defineProperty(defaultNetwork, 'vaults', {
			value: vaults.map((vault) => ({
				depositToken: { address: vault.underlyingToken, decimals: 18 },
				vaultToken: { address: vault.vaultToken, decimals: 18 },
			})),
		});

		store.vaults.getVaultMap = jest
			.fn()
			.mockReturnValue(Object.fromEntries(vaults.map((vault) => [vault.vaultToken, vault])));

		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay state={VaultState.Open} />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByLabelText('Open Vaults Filters'));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Boosted Tokens' }));
		fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

		expect(container).toMatchSnapshot();
	});
});
