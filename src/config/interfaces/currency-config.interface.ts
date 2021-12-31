import { ExchangeRates } from 'mobx/model/system-config/exchange-rates';

export interface CurrencyConfig {
  getExchangeRate: (rates: ExchangeRates) => number;
  decimals: number;
  prefix: string;
}
