import { SettMap } from './sett-map';

export interface SettCache {
  [chain: string]: SettMap | undefined | null;
}
