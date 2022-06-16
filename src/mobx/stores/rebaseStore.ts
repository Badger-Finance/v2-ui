import { action, extendObservable } from 'mobx';
import { RootStore } from '../RootStore';
import { RebaseInfo } from 'mobx/model/tokens/rebase-info';

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
