import React from 'react';
import { VaultSortOrder } from '../mobx/model/ui/vaults-filters';
import { customRender, screen, fireEvent } from './Utils';
import TableHeader from '../components-v2/landing/TableHeader';
import store from '../mobx/RootStore';
import { StoreProvider } from '../mobx/store-context';

type SortTestingOptions = undefined | VaultSortOrder;

describe('Table Header', () => {
	describe('content sorting', () => {
		describe('by APR', () => {
			test.each([
				[undefined, VaultSortOrder.APR_DESC],
				[VaultSortOrder.APR_DESC, VaultSortOrder.APR_ASC],
				[VaultSortOrder.APR_ASC, undefined],
			])('cycle from %p to %p', (startSortOrder: SortTestingOptions, endSortOrder: SortTestingOptions) => {
				store.uiState.vaultsFilters.sortOrder = startSortOrder;

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
						<TableHeader title="All Setts" />
					</StoreProvider>,
				);

				fireEvent.click(screen.getByAltText(altText));

				expect(store.uiState.vaultsFilters.sortOrder).toBe(endSortOrder);
			});
		});

		describe('by TVL', () => {
			test.each([
				[undefined, VaultSortOrder.TVL_DESC],
				[VaultSortOrder.TVL_DESC, VaultSortOrder.TVL_ASC],
				[VaultSortOrder.TVL_ASC, undefined],
			])('cycle from %p to %p', (startSortOrder: SortTestingOptions, endSortOrder: SortTestingOptions) => {
				store.uiState.vaultsFilters.sortOrder = startSortOrder;

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
						<TableHeader title="All Setts" />
					</StoreProvider>,
				);

				fireEvent.click(screen.getByAltText(altText));

				expect(store.uiState.vaultsFilters.sortOrder).toBe(endSortOrder);
			});
		});
	});
});
