import React from 'react';
import { VaultSortOrder } from '../mobx/model/ui/vaults-filters';
import { customRender, screen, fireEvent } from './Utils';
import VaultListHeader from '../components-v2/landing/VaultListHeader';
import store from '../mobx/RootStore';
import { StoreProvider } from '../mobx/store-context';
import { checkSnapshot } from './utils/snapshots';

type SortTestingOptions = undefined | VaultSortOrder;

describe('Vault List Header', () => {
	it('renders correctly', () => {
		checkSnapshot(
			<VaultListHeader
				title="All Setts"
				helperText="A vault is a smart contract which hold specific tokens. It secures your crypto, while making your money work (e.g. rewards, APR...)"
			/>,
		);
	});

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
						<VaultListHeader title="All Setts" />
					</StoreProvider>,
				);

				fireEvent.click(screen.getByLabelText(altText));

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
						<VaultListHeader title="All Setts" />
					</StoreProvider>,
				);

				fireEvent.click(screen.getByLabelText(altText));

				expect(store.uiState.vaultsFilters.sortOrder).toBe(endSortOrder);
			});
		});
	});
});
