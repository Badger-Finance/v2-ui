import { toURLBase64 } from '@renproject/utils';

import { DEBUG } from '../../../../../config/environment';

const assert = (input: boolean) => {
	if (!input) {
		throw new Error(`'require' failed.`);
	}
};

const doesntError = <T extends any[]>(f: (...p: T) => boolean | void) => {
	return (...p: T) => {
		try {
			const response = f(...p);
			return response === undefined || response === true ? true : false;
		} catch (error) {
			if (DEBUG) {
				console.error(error);
			}
			return false;
		}
	};
};

export const isBase64 = doesntError(
	(
		input: string,
		options: {
			length?: number;
		} = {},
	) => {
		const buffer = Buffer.from(input, 'base64');
		assert(options.length === undefined || buffer.length === options.length);
		assert(buffer.toString('base64') === input);
	},
);

export const isURLBase64 = doesntError(
	(
		input: string,
		options: {
			length?: number;
		} = {},
	) => {
		const buffer = Buffer.from(input, 'base64');
		assert(options.length === undefined || buffer.length === options.length);
		assert(toURLBase64(buffer) === input);
	},
);

export const isHex = doesntError(
	(
		input: string,
		options: {
			length?: number;
		} = {},
	) => {
		const buffer = Buffer.from(input, 'hex');
		assert(options.length === undefined || buffer.length === options.length);
		assert(buffer.toString('hex') === input);
	},
);
