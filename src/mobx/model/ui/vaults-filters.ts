import { Currency } from '../../../config/enums/currency.enum';
import { VaultType } from '@badger-dao/sdk';

export enum VaultSortOrder {
	APR_ASC = 'APR_ASC',
	APR_DESC = 'APR_DESC',
	TVL_ASC = 'TVL_ASC',
	TVL_DESC = 'TVL_DESC',
}

export interface VaultsFilters {
	hidePortfolioDust: boolean;
	currency: Currency;
	protocols: string[];
	types: VaultType[];
	sortOrder?: VaultSortOrder;
}
