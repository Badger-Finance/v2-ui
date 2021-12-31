export interface BatchResponse {
  address: string;
  namespace: string;
}

export interface BatchContractItem {
  args: string[];
  input: string;
  value: string;
}
