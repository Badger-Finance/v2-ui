import { BadgerToken } from 'mobx/model/badger-token';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { bscProtocolTokens } from './bsc-config';
import { ethProtocolTokens } from './eth-config';

export const protocolTokens = (): ProtocolTokens => {
	return {
		...(ethProtocolTokens && ethProtocolTokens),
		...(bscProtocolTokens && bscProtocolTokens),
	};
};

export const getToken = (address: string): BadgerToken | undefined => {
	return protocolTokens()[address];
};

/**
 * https://stackoverflow.com/questions/61414459/typescript-generic-array-to-record-function-with-proper-type-restrictions
 */
export function toRecord<
	T extends { [K in keyof T]: string | number | symbol }, // added constraint
	K extends keyof T
>(array: T[], selector: K): Record<T[K], T> {
	return array.reduce((acc, item) => ((acc[item[selector]] = item), acc), {} as Record<T[K], T>);
}
