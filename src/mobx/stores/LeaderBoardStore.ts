import { LeaderboardSummary } from '@badger-dao/sdk';
import { action, extendObservable } from 'mobx';
import { RootStore } from 'mobx/RootStore';

export class LeaderBoardStore {
	private store: RootStore;
	public ranks?: LeaderboardSummary;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			ranks: this.ranks,
		});
	}

	loadData = action(async (): Promise<void> => {
		const summary = await this.store.badgerSDK.api.loadLeaderboardSummary();

		if (summary) {
			this.ranks = summary;
		}
	});
}
