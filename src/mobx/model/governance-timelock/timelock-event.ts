export interface TimelockEvent {
    blockNumber: number;
    status: string;
    timeStamp: string;
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
