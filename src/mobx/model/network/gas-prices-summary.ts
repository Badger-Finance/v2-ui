import { GasPrices } from '@badger-dao/sdk';

export type GasPricesSummary = {
  [network: string]: GasPrices;
};
