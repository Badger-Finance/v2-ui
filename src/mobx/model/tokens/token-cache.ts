import { TokenConfigRecord } from 'mobx/model/tokens/token-config-record';

export interface TokenCache {
  [chain: string]: TokenConfigRecord | undefined | null;
}
