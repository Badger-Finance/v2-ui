import React from 'react';
import '@testing-library/jest-dom';
import { TokenBalance } from '../mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';
import VaultStore from '../mobx/stores/VaultStore';
import store from '../mobx/RootStore';
import { RewardsWidget } from '../components-v2/landing/RewardsWidget';
import { OnboardStore } from '../mobx/stores/OnboardStore';
import RewardsStore from '../mobx/stores/rewardsStore';
import { customRender, fireEvent, screen } from './Utils';
import { StoreProvider } from '../mobx/store-context';
import { action } from 'mobx';
import { TransactionRequestResult } from '../mobx/utils/web3';
import { VaultType } from '@badger-dao/sdk/lib/api/enums';

const mockExchangesRates = {
	usd: 4337.2,
	cad: 5487.64,
	btc: 0.07463853,
	bnb: 7.230643,
	matic: 2502.8156676260796,
	xdai: 4337.2,
};

const mockClaimProof = {
	index: '0x33d4',
	cycle: '0xe36',
	user: '0x0000000000000000000000000000000000000001',
	tokens: [
		'0x3472A5A71965499acd81997a54BBA8D852C6E53d',
		'0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
		'0x2B5455aac8d64C14786c3a29858E43b5945819C0',
	],
	cumulativeAmounts: ['28019610295276968', '24529508667974375', '39890071517351528'],
	proof: ['0x0000000000000000000000000000000000000001'],
	node: '0x0000000000000000000000000000000000000001',
	boost: new BigNumber(1),
};

const mockBadgerTreeClaims: TokenBalance[] = [
	new TokenBalance(
		{
			name: 'Badger',
			symbol: 'BADGER',
			decimals: 18,
			address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
		},
		new BigNumber('28019610295276968'),
		new BigNumber('0.028019610295276968'),
	),
	new TokenBalance(
		{
			name: 'bveCVX',
			symbol: 'bveCVX',
			decimals: 18,
			address: '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
		},
		new BigNumber('24529508667974375'),
		new BigNumber('0.024529508667974375'),
	),
	new TokenBalance(
		{
			name: 'bCVXCRV',
			symbol: 'bCVXCRV',
			decimals: 18,
			address: '0x2B5455aac8d64C14786c3a29858E43b5945819C0',
		},
		new BigNumber('39890071517351528'),
		new BigNumber('0.039890071517351528'),
	),
];

describe('Rewards Widget', () => {
	beforeEach(() => {
		jest.spyOn(OnboardStore.prototype, 'isActive').mockReturnValue(true);
		jest.spyOn(RewardsStore.prototype, 'isLoading', 'get').mockReturnValue(false);
		store.user.claimProof = mockClaimProof;
		store.prices.exchangeRates = mockExchangesRates;
		store.rewards.loadTreeData = action(jest.fn());
	});

	describe('when there are no rewards', () => {
		it('displays zero amount in rewards button', () => {
			const { container } = customRender(
				<StoreProvider value={store}>
					<RewardsWidget />
				</StoreProvider>,
			);
			expect(container).toMatchSnapshot();
		});

		it('displays no rewards dialog', () => {
			const { baseElement } = customRender(
				<StoreProvider value={store}>
					<RewardsWidget />
				</StoreProvider>,
			);

			fireEvent.click(screen.getByRole('button', { name: 'open rewards dialog' }));
			expect(baseElement).toMatchSnapshot();
		});
	});

	describe('when there are rewards', () => {
		beforeEach(() => {
			jest.spyOn(VaultStore.prototype, 'getToken').mockReturnValue({
				name: 'Badger',
				symbol: 'BADGER',
				decimals: 18,
				address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
			});
			store.rewards.badgerTree.claims = mockBadgerTreeClaims;
		});

		it('displays rewards amount in rewards button', () => {
			const { container } = customRender(
				<StoreProvider value={store}>
					<RewardsWidget />
				</StoreProvider>,
			);
			expect(container).toMatchSnapshot();
		});

		it('displays claim options', async () => {
			const { baseElement } = customRender(
				<StoreProvider value={store}>
					<RewardsWidget />
				</StoreProvider>,
			);

			fireEvent.click(screen.getByRole('button', { name: 'open rewards dialog' }));
			expect(baseElement).toMatchSnapshot();
		});

		it('can display user guide', () => {
			const { baseElement } = customRender(
				<StoreProvider value={store}>
					<RewardsWidget />
				</StoreProvider>,
			);

			fireEvent.click(screen.getByRole('button', { name: 'open rewards dialog' }));
			fireEvent.click(screen.getByText('Rewards User Guide'));
			expect(baseElement).toMatchSnapshot();
		});

		it('can go back from user guide', () => {
			const { baseElement } = customRender(
				<StoreProvider value={store}>
					<RewardsWidget />
				</StoreProvider>,
			);

			fireEvent.click(screen.getByRole('button', { name: 'open rewards dialog' }));
			fireEvent.click(screen.getByText('Rewards User Guide'));
			fireEvent.click(screen.getByRole('button', { name: 'exit guide mode' }));
			expect(baseElement).toMatchSnapshot();
		});

		describe('going to vaults from user guide', () => {
			beforeEach(() => {
				customRender(
					<StoreProvider value={store}>
						<RewardsWidget />
					</StoreProvider>,
				);

				fireEvent.click(screen.getByRole('button', { name: 'open rewards dialog' }));
				fireEvent.click(screen.getByText('Rewards User Guide'));
			});

			it('can go to native vaults', () => {
				fireEvent.click(screen.getByRole('button', { name: 'view badger dao tokens' }));
				expect(store.vaults.vaultsFilters.types).toEqual([VaultType.Native]);
			});

			it('can go to non-boosted vaults', () => {
				fireEvent.click(screen.getByRole('button', { name: 'view non-boosted tokens' }));
				expect(store.vaults.vaultsFilters.types).toEqual([VaultType.Standard]);
			});

			it('can go to boosted vaults', () => {
				fireEvent.click(screen.getByRole('button', { name: 'view boosted tokens' }));
				expect(store.vaults.vaultsFilters.types).toEqual([VaultType.Boosted]);
			});
		});

		it('executes claim geysers with correct parameters', async () => {
			const claimSpy = jest.fn().mockReturnValue(TransactionRequestResult.Success);

			const expectedParameters = Object.fromEntries(
				mockBadgerTreeClaims.map((claim) => [claim.token.address, claim]),
			);

			store.rewards.claimGeysers = action(claimSpy);

			customRender(
				<StoreProvider value={store}>
					<RewardsWidget />
				</StoreProvider>,
			);

			fireEvent.click(screen.getByRole('button', { name: 'open rewards dialog' }));
			fireEvent.click(screen.getByRole('button', { name: 'Claim My Rewards' }));
			await screen.findByText('Rewards Claimed');

			expect(claimSpy).toHaveBeenNthCalledWith(1, expectedParameters);
		});

		it('displays success dialog', async () => {
			store.rewards.claimGeysers = action(jest.fn().mockReturnValue(TransactionRequestResult.Success));

			const { baseElement } = customRender(
				<StoreProvider value={store}>
					<RewardsWidget />
				</StoreProvider>,
			);

			fireEvent.click(screen.getByRole('button', { name: 'open rewards dialog' }));
			fireEvent.click(screen.getByRole('button', { name: 'Claim My Rewards' }));
			await screen.findByText('Rewards Claimed');

			expect(baseElement).toMatchSnapshot();
		});
	});
});
