import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import VaultListHeader from '../components-v2/landing/VaultListHeader';
import { VaultSortOrder } from '../mobx/model/ui/vaults-filters';
import store from '../mobx/stores/RootStore';
import { customRender, fireEvent, screen } from './Utils';
import { checkSnapshot } from './utils/snapshots';

type SortTestingOptions = undefined | VaultSortOrder;

describe('Vault List Header', () => {
	it('renders correctly', () => {
		checkSnapshot(<VaultListHeader />);
	});

	describe('content sorting', () => {
		describe('by APR', () => {
			test.each([
				[undefined, VaultSortOrder.APR_DESC],
				[VaultSortOrder.APR_DESC, VaultSortOrder.APR_ASC],
				[VaultSortOrder.APR_ASC, undefined],
			])('cycle from %p to %p', (startSortOrder: SortTestingOptions, endSortOrder: SortTestingOptions) => {
				store.vaults.vaultsFilters.sortOrder = startSortOrder;

				let altText: string;

				switch (startSortOrder) {
					case VaultSortOrder.APR_DESC:
						altText = 'sort ascending by APR';
						break;
					case VaultSortOrder.APR_ASC:
						altText = 'reset sort by APR';
						break;
					default:
						altText = 'sort descending by APR';
						break;
				}

				customRender(
					<StoreProvider value={store}>
						<VaultListHeader />,
					</StoreProvider>,
				);

				fireEvent.click(screen.getByLabelText(altText));

				expect(store.vaults.vaultsFilters.sortOrder).toBe(endSortOrder);
			});
		});

		describe('by TVL', () => {
			test.each([
				[undefined, VaultSortOrder.TVL_DESC],
				[VaultSortOrder.TVL_DESC, VaultSortOrder.TVL_ASC],
				[VaultSortOrder.TVL_ASC, undefined],
			])('cycle from %p to %p', (startSortOrder: SortTestingOptions, endSortOrder: SortTestingOptions) => {
				store.vaults.vaultsFilters.sortOrder = startSortOrder;

				let altText: string;

				switch (startSortOrder) {
					case VaultSortOrder.TVL_DESC:
						altText = 'sort ascending by TVL';
						break;
					case VaultSortOrder.TVL_ASC:
						altText = 'reset sort by TVL';
						break;
					default:
						altText = 'sort descending by TVL';
						break;
				}

				customRender(
					<StoreProvider value={store}>
						<VaultListHeader />,
					</StoreProvider>,
				);

				fireEvent.click(screen.getByLabelText(altText));

				expect(store.vaults.vaultsFilters.sortOrder).toBe(endSortOrder);
			});
		});

		describe('by balance', () => {
			test.each([
				[undefined, VaultSortOrder.BALANCE_DESC],
				[VaultSortOrder.BALANCE_DESC, VaultSortOrder.BALANCE_ASC],
				[VaultSortOrder.BALANCE_ASC, undefined],
			])('cycle from %p to %p', (startSortOrder: SortTestingOptions, endSortOrder: SortTestingOptions) => {
				store.vaults.vaultsFilters.sortOrder = startSortOrder;

				let altText: string;

				switch (startSortOrder) {
					case VaultSortOrder.BALANCE_DESC:
						altText = 'sort ascending by balance';
						break;
					case VaultSortOrder.BALANCE_ASC:
						altText = 'reset sort by balance';
						break;
					default:
						altText = 'sort descending by balance';
						break;
				}

				customRender(
					<StoreProvider value={store}>
						<VaultListHeader />,
					</StoreProvider>,
				);

				fireEvent.click(screen.getByLabelText(altText));

				expect(store.vaults.vaultsFilters.sortOrder).toBe(endSortOrder);
			});
		});
	});
});
