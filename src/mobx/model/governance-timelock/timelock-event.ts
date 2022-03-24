export interface TimelockEvent {
	status: string;
	timeStamp: string;
	timeRemaining: number;
	doneBy: string;
	proposer: string;
	event: string;
	functionName?: string;
	parameterTypes?: string[];
	decodedParameters?: any;
	returnValues: {
		signature?: string;
		data?: any;
	};
}
