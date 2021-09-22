// See https://github.com/facebook/jest/issues/9983
import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';

Object.defineProperty(global, 'crypto', {
	value: { getRandomValues: (arr) => crypto.randomBytes(arr.length) },
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
export default function () {
	return null;
}
