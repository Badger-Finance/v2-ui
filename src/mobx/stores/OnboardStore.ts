import { RootStore } from 'mobx/RootStore';
import Notify, { API as NotifyAPI, InitOptions } from 'bnc-notify';
import { BLOCKNATIVE_API_KEY } from 'config/constants';
import { NetworkConfig } from '@badger-dao/sdk';

export class OnboardStore {
	public notify: NotifyAPI;

	constructor(private store: RootStore, config: NetworkConfig) {
		const notifyOptions: InitOptions = {
			dappId: BLOCKNATIVE_API_KEY,
			networkId: config.chainId,
		};
		this.notify = Notify(notifyOptions);
	}
}
