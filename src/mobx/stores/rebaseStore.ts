import { action, extendObservable } from 'mobx';
import { RebaseInfo } from 'mobx/model/tokens/rebase-info';

import { RootStore } from '../RootStore';

class RebaseStore {
	private store: RootStore;
	public rebase?: RebaseInfo;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			rebase: this.rebase,
		});
	}

	fetchRebaseStats = action(async () => {
		const { sdk } = this.store;

		// temporary while sdk init in root store is not utilized
		await sdk.ready();

		const { digg: diggContract } = sdk.digg;
		const sharesPerFragment = await diggContract._sharesPerFragment();

		this.rebase = {
			sharesPerFragment,
		};
	});
}

export default RebaseStore;
