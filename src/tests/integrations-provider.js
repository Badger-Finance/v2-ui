'use strict';

const globalObject = require('the-global-object');
const memdown = require('memdown');
const encode = require('encoding-down');
const { Buffer } = require('buffer');
const BN = require('bn.js/lib/bn.js');

BN.prototype.toBuffer = function (endian, length) {
	return this.toArrayLike(Buffer, endian, length);
};
const { binding } = process;
process.binding = () => ({
	fs: {},
	os: {
		errno: {},
	},
});
const Provider = require('ganache-core/lib/provider');

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
const provider = (o) => new BrowserProvider(o);
provider.BrowserProvider = BrowserProvider;

module.exports = provider;
