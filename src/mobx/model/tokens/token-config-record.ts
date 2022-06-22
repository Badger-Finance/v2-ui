import { Token } from './token';

export interface TokenConfigRecord {
  [address: string]: Token;
}
