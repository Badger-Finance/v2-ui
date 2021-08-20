// See https://github.com/facebook/jest/issues/9983
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
export default function () {
	return null;
}
