import { Protocol, VaultBehavior, VaultState, VaultType } from '@badger-dao/sdk';

import { Currency } from '../../../config/enums/currency.enum';

export enum VaultSortOrder {
	APR_ASC = 'APR_ASC',
	APR_DESC = 'APR_DESC',
	TVL_ASC = 'TVL_ASC',
	TVL_DESC = 'TVL_DESC',
	BALANCE_ASC = 'BALANCE_ASC',
	BALANCE_DESC = 'BALANCE_DESC',
	NAME_ASC = 'NAME_ASC',
	NAME_DESC = 'NAME_DESC',
}

export interface VaultsFilters {
	hidePortfolioDust: boolean;
	sortOrder?: VaultSortOrder;
	showAPR: boolean;
	currency: Currency;
	onlyDeposits: boolean;
	onlyBoostedVaults: boolean;
	protocols?: Protocol[];
	types?: VaultType[];
	statuses?: VaultState[];
	behaviors?: VaultBehavior[];
	search?: string;
}
