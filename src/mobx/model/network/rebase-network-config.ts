import { ContractCallContext } from 'ethereum-multicall/dist/esm/models/contract-call-context';

export type RebaseNetworkConfig = {
	digg: ContractCallContext[];
	orchestrator: ContractCallContext;
};
