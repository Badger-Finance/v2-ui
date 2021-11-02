export interface TimelockEvent {
	blockNumber: number;
	event: string;
	functionName?: string;
	parameterTypes?: string[];
	decodedParameters?: any;
	returnValues:{
		signature?: string,
		data?: any
	};
}
