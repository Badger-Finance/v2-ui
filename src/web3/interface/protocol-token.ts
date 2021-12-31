import { BadgerToken } from 'mobx/model/tokens/badger-token';

export interface ProtocolTokens {
  [address: string]: BadgerToken;
}
