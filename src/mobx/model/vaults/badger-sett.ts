import { BadgerToken } from '../tokens/badger-token';
import { AdvisoryType } from './advisory-type';

export interface BadgerSett {
  depositToken: BadgerToken;
  vaultToken: BadgerToken; // rename to settToken for API response
  geyser?: string;
  vaultAdvisory?: AdvisoryType;
}
