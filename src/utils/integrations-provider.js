'use strict';

import memdown from 'memdown';
import encode from 'encoding-down';
import { Buffer } from 'buffer';
import { prototype } from 'bn.js/lib/bn.js';
import Provider from 'ganache-core/lib/provider';

prototype.toBuffer = function (endian, length) {
	return this.toArrayLike(Buffer, endian, length);
};
const { binding } = process;
process.binding = () => ({
	fs: {},
	os: {
		errno: {},
	},
});

process.binding = binding;
class BrowserProvider extends Provider {
	constructor(o) {
		super(
			Object.assign({}, o || {}, {
				db: encode(memdown(), { valueEncoding: 'json' }),
				db_path: '/',
			}),
		);
	}
}
// Disable reason: Javascript file
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const provider = (o) => new BrowserProvider(o);
provider.BrowserProvider = BrowserProvider;

export default provider;
