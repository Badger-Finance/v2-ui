// See https://github.com/facebook/jest/issues/9983
import { TextEncoder, TextDecoder } from 'util';
export default function (): void {
	global.TextEncoder = TextEncoder;
	global.TextDecoder = TextDecoder;
}
