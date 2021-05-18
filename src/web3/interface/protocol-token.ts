import { BadgerToken } from 'mobx/model/badger-token';

export interface ProtocolTokens {
	[address: string]: BadgerToken;
}
