import React from 'react';
import store from '../../mobx/RootStore';
import { StoreProvider } from '../../mobx/store-context';
import { Protocol, Vault, VaultState } from '@badger-dao/sdk';
import { ExchangeRates } from '../../mobx/model/system-config/exchange-rates';
import { customRender, fireEvent, screen } from '../Utils';
import VaultListDisplay from '../../components-v2/landing/VaultListDisplay';
import { Currency } from '../../config/enums/currency.enum';
import UserStore from '../../mobx/stores/UserStore';
import { BalanceNamespace } from '../../web3/config/namespaces';
import { BadgerVault } from '../../mobx/model/vaults/badger-vault';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';
import { SAMPLE_VAULTS } from '../utils/samples';
import VaultStore from '../../mobx/stores/VaultStore';

const sampleExchangeRates: ExchangeRates = {
	usd: 3371.56,
	cad: 4215.55,
	btc: 0.07670423,
	bnb: 6.915813,
	matic: 1423.994304022784,
	xdai: 1,
	ftm: 1,
	avax: 1,
};

const mockVaultsInformation = (vaults: Vault[]) => {
	jest.spyOn(VaultStore.prototype, 'vaultsDefinitions', 'get').mockReturnValue(
		new Map(
			vaults.map((vault) => [
				vault.vaultToken,
				{
					depositToken: { address: vault.underlyingToken, decimals: 18 },
					vaultToken: { address: vault.vaultToken, decimals: 18 },
				},
			]),
		),
	);

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
});
