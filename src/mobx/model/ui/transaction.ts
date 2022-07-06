export interface Transaction {
  hash: string;
  addedTime: number;
  name: string;
  description?: string;
  status?: number;
}
