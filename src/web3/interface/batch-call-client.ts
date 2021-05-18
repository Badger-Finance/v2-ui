import { CallOptions } from 'web3-eth-contract';
import { BatchCallRequest } from './batch-call-request';

export interface BatchCallClient {
	execute(requests: BatchCallRequest[], callOptions?: CallOptions): any;
}
