import { SettMap } from 'mobx/model';

export interface SettCache {
	[chain: string]: SettMap | undefined | null;
}
