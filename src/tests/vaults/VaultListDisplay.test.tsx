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
import { SAMPLE_VAULTS } from '../utils/samples';

const sampleExchangeRates: ExchangeRates = {
	usd: 3371.56,
	cad: 4215.55,
	btc: 0.07670423,
	bnb: 6.915813,
	matic: 1423.994304022784,
	xdai: 1,
	ftm: 2,
};

const vaultsWithDuplicatedNames: Vault[] = [
	{
		name: 'CVX',
		asset: 'CVX',
		vaultAsset: 'bCVX',
		state: VaultState.Open,
		underlyingToken: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
		vaultToken: '0x53C8E199eb2Cb7c01543C137078a038937a68E40',
		value: 513.8239198230096,
		available: 0,
		balance: 57638.213076805085,
		protocol: Protocol.Convex,
		pricePerFullShare: 1.0948552311940103,
		tokens: [
			{
				address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
				name: 'Convex Token',
				symbol: 'CVX',
				decimals: 18,
				balance: 57638.213076805085,
				value: 513.8239198230096,
			},
		],
		apr: 23.90718524173766,
		boost: {
			enabled: false,
			weight: 0,
		},
		sources: [
			{
				name: 'Vault Compounding',
				apr: 23.90718524173766,
				boostable: false,
				harvestable: false,
				performance: {
					oneDay: 169.93473567537026,
					threeDay: 56.03859055449575,
					sevenDay: 23.90718524173766,
					thirtyDay: 5.5753455469262745,
				},
				minApr: 23.90718524173766,
				maxApr: 23.90718524173766,
			},
		],
		bouncer: BouncerType.None,
		strategy: {
			address: '0xBCee2c6CfA7A4e29892c3665f464Be5536F16D95',
			withdrawFee: 10,
			performanceFee: 1000,
			strategistFee: 0,
		},
		type: VaultType.Standard,
	},
	{
		name: 'CVX',
		asset: 'CVX',
		vaultAsset: 'bveCVX',
		state: VaultState.Open,
		underlyingToken: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
		vaultToken: '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
		value: 8296.481907809222,
		available: 0,
		balance: 930658.0981182889,
		protocol: Protocol.Convex,
		pricePerFullShare: 1,
		tokens: [
			{
				address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
				name: 'Convex Token',
				symbol: 'CVX',
				decimals: 18,
				balance: 930658.0981182889,
				value: 8296.481907809222,
			},
		],
		apr: 83.29826484856468,
		boost: {
			enabled: false,
			weight: 0,
		},
		sources: [
			{
				name: 'bveCVX Rewards',
				apr: 42.95486646951447,
				boostable: false,
				harvestable: false,
				performance: {
					oneDay: 42.95486646951447,
					threeDay: 42.95486646951447,
					sevenDay: 42.95486646951447,
					thirtyDay: 42.95486646951447,
				},
				minApr: 42.95486646951447,
				maxApr: 42.95486646951447,
			},
			{
				name: 'Badger Rewards',
				apr: 21.928990873490303,
				boostable: false,
				harvestable: false,
				performance: {
					oneDay: 21.928990873490303,
					threeDay: 21.928990873490303,
					sevenDay: 21.928990873490303,
					thirtyDay: 21.928990873490303,
				},
				minApr: 21.928990873490303,
				maxApr: 21.928990873490303,
			},
			{
				name: 'bCVXCRV Rewards',
				apr: 18.4144075055599,
				boostable: false,
				harvestable: false,
				performance: {
					oneDay: 18.4144075055599,
					threeDay: 18.4144075055599,
					sevenDay: 18.4144075055599,
					thirtyDay: 18.4144075055599,
				},
				minApr: 18.4144075055599,
				maxApr: 18.4144075055599,
			},
		],
		bouncer: BouncerType.None,
		strategy: {
			address: '0x3ff634ce65cDb8CC0D569D6d1697c41aa666cEA9',
			withdrawFee: 10,
			performanceFee: 0,
			strategistFee: 0,
		},
		type: VaultType.Standard,
	},
];

const mockVaultsInformation = (vaults: Vault[]) => {
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
};

describe('VaultListDisplay', () => {
	beforeEach(() => {
		mockVaultsInformation(SAMPLE_VAULTS);
		store.prices.exchangeRates = sampleExchangeRates;
	});

	afterEach(() => {
		jest.restoreAllMocks();
		store.vaults.clearFilters();
	});

	it('can clear dust from portfolio', () => {
		const sampleVaults = [...SAMPLE_VAULTS];

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
				<VaultListDisplay />
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
				<VaultListDisplay />
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
				<VaultListDisplay />
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
				<VaultListDisplay />
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
				<VaultListDisplay />
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
		const vaults = [...SAMPLE_VAULTS].splice(1, 2);
		mockVaultsInformation(vaults);

		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByLabelText('Open Vaults Filters'));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Boosted Tokens' }));
		fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

		expect(container).toMatchSnapshot();
	});

	it('does not display deprecated vaults with no user balance', () => {
		const vaults = [...SAMPLE_VAULTS].splice(0, 1);
		vaults[0].state = VaultState.Deprecated;

		mockVaultsInformation(vaults);

		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay />
			</StoreProvider>,
		);

		expect(container).toMatchSnapshot();
	});

	it('uses default sort criteria by default', () => {
		const vaults = [...SAMPLE_VAULTS];

		mockVaultsInformation(vaults);

		jest.spyOn(UserStore.prototype, 'getTokenBalance').mockImplementation((address: string) => {
			if (address === vaults[2].vaultToken) {
				return new TokenBalance(
					{
						address,
						symbol: '',
						decimals: 18,
						name: '',
					},
					new BigNumber(10),
					new BigNumber(2),
				);
			}

			if (address === vaults[1].underlyingToken) {
				return new TokenBalance(
					{
						address,
						symbol: '',
						decimals: 18,
						name: '',
					},
					new BigNumber(1),
					new BigNumber(2),
				);
			}

			return new TokenBalance(
				{
					address,
					symbol: '',
					decimals: 18,
					name: '',
				},
				new BigNumber(0),
				new BigNumber(0),
			);
		});

		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay />
			</StoreProvider>,
		);

		expect(container).toMatchSnapshot();
	});

	it('handles duplicates in vault list', () => {
		const fallbackDepositTokenSymbol = 'bCVX';

		mockVaultsInformation(vaultsWithDuplicatedNames);

		jest.spyOn(UserStore.prototype, 'getBalance').mockImplementation(() => {
			return new TokenBalance(
				{
					address: vaultsWithDuplicatedNames[1].vaultToken,
					symbol: fallbackDepositTokenSymbol,
					decimals: 18,
					name: fallbackDepositTokenSymbol,
				},
				new BigNumber(0),
				new BigNumber(0),
			);
		});

		customRender(
			<StoreProvider value={store}>
				<VaultListDisplay />
			</StoreProvider>,
		);

		expect(
			screen.getAllByText(`${vaultsWithDuplicatedNames[0].protocol} - ${vaultsWithDuplicatedNames[0].name}`),
		).toHaveLength(1);

		expect(
			screen.getByText(`${vaultsWithDuplicatedNames[1].protocol} - ${fallbackDepositTokenSymbol}`),
		).toBeInTheDocument();
	});
});
