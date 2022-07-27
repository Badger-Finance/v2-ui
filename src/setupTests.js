import { BadgerAPI } from '@badger-dao/sdk';
import fetchMock from 'jest-fetch-mock';
import { configure } from 'mobx';

jest.mock('web3modal');

fetchMock.enableMocks();

configure({
  enforceActions: 'never',
});

jest.spyOn(BadgerAPI.prototype, 'loadVaults').mockReturnValue([]);

jest.spyOn(BadgerAPI.prototype, 'loadGasPrices').mockReturnValue(Promise.resolve({}));

jest.spyOn(BadgerAPI.prototype, 'loadProtocolSummary').mockReturnValue(
  Promise.resolve({
    totalValue: 1_000_000_000,
    setts: [],
  }),
);

export default function () {
  return null;
}
