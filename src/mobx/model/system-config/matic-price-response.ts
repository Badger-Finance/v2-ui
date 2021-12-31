export const MATIC_PRICE_KEY = 'matic-network';

export interface MaticPriceResponse {
  [MATIC_PRICE_KEY]: {
    eth: number;
  };
}
