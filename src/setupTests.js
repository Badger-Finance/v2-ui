// See https://github.com/facebook/jest/issues/9983
import fetchMock from 'jest-fetch-mock';

jest.mock('web3modal');

fetchMock.enableMocks();

export default function () {
  return null;
}
