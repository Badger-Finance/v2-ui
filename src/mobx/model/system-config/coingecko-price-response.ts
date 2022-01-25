export const MATIC_PRICE_KEY = 'matic-network';
export const FANTOM_PRICE_KEY = 'fantom';

export interface CoingeckoPriceResponse {
	[key: string]: {
		eth: number;
	};
}
