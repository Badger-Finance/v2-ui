// See https://github.com/facebook/jest/issues/9983
import { TextEncoder, TextDecoder } from 'util';
import fetchMock from 'jest-fetch-mock';
import crypto from 'crypto';

Object.defineProperty(global, 'crypto', {
	value: { getRandomValues: (arr) => crypto.randomBytes(arr.length) },
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

fetchMock.enableMocks();

export default function () {
	return null;
}
