import fetchMock from 'jest-fetch-mock';
import { configure } from 'mobx';

jest.mock('web3modal');

fetchMock.enableMocks();

configure({
  enforceActions: 'never',
});

export default function () {
  return null;
}
