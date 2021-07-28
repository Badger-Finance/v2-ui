import { BatchContractItem, BatchResponse } from '../contract/batch-response';

export interface DroptInfo {
	[address: string]: {
		currentTimestamp: string;
		expirationTimestamp: string;
		expiryPrice: string;
	};
}

export interface DroptContractResponse extends BatchResponse {
	expirationTimestamp: BatchContractItem[];
	expiryPrice: BatchContractItem[];
	getCurrentTime: BatchContractItem[];
}
