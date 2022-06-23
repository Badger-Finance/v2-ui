// this should not even exist... let's just ignore it for now, sigh...
/* eslint-disable */
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
