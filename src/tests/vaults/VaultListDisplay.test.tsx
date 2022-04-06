import React from 'react';
import store from '../../mobx/RootStore';
import { StoreProvider } from '../../mobx/store-context';
import { VaultDTO, VaultState } from '@badger-dao/sdk';
import { customRender } from '../Utils';
import VaultListDisplay from '../../components-v2/landing/VaultListDisplay';
import UserStore from '../../mobx/stores/UserStore';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';
import { SAMPLE_EXCHANGES_RATES, SAMPLE_VAULTS } from '../utils/samples';
import VaultStore from '../../mobx/stores/VaultStore';

const mockVaultsInformation = (vaults: VaultDTO[]) => {
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
		store.prices.exchangeRates = SAMPLE_EXCHANGES_RATES;
	});

	afterEach(() => {
		jest.restoreAllMocks();
		store.vaults.clearFilters();
	});

	it('displays empty search message', () => {
		mockVaultsInformation([]);
		jest.spyOn(VaultStore.prototype, 'vaultsFiltersCount', 'get').mockReturnValue(1);

		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay />
			</StoreProvider>,
		);

		expect(container).toMatchSnapshot();
	});

	it('displays no vaults message', () => {
		mockVaultsInformation([]);
		jest.spyOn(VaultStore.prototype, 'vaultsFiltersCount', 'get').mockReturnValue(0);

		const { container } = customRender(
			<StoreProvider value={store}>
				<VaultListDisplay />
			</StoreProvider>,
		);

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
