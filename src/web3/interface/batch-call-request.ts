import { AbiItem } from 'web3-utils';
import { ReadMethod } from './read-method';

export interface BatchCallRequest {
	// Specify a namespace to identify this configuration. Optional. Namespace will be used to group contract results
	namespace?: string;
	// Specify a list of addresses to iterate through for this config. Must select addresses OR contracts
	addresses?: string[];
	contracts?: string[];
	abi: AbiItem[];
	store: string;
	groupByNamespace: boolean;
	logging: boolean;
	simplifyResponse: boolean;
	allReadMethods: boolean;
	readMethods: ReadMethod[];
}
