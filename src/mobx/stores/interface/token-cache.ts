import { TokenConfig } from 'mobx/model/token-config';

export interface TokenCache {
	[chain: string]: TokenConfig | undefined | null;
}
