// See https://github.com/facebook/jest/issues/9983
import fetchMock from 'jest-fetch-mock';

// import { TextDecoder, TextEncoder } from 'util';
import { setupMockAPI } from './tests/utils/setup';

// Object.defineProperty(global, 'crypto', {
//   value: { getRandomValues: (arr) => crypto.randomBytes(arr.length) },
// });

jest.mock('web3modal');

// global.TextEncoder = TextEncoder;
// global.TextDecoder = TextDecoder;

fetchMock.enableMocks();
setupMockAPI();

export default function () {
  return null;
}
