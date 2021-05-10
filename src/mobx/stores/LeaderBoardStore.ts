import { action, extendObservable } from 'mobx';
import { LeaderBoardData } from 'mobx/model';
import { RootStore } from 'mobx/store';
import { fetchLeaderBoardData } from 'mobx/utils/apiV2';

export class LeaderBoardStore {
	private store: RootStore;

	private page: number;
	private size: number;
	public data: LeaderBoardData | undefined | null;

	constructor(store: RootStore) {
		this.store = store;
		this.page = 0;
		this.size = 20;

		extendObservable(this, {
			data: this.data,
		});

		this.loadData();
	}

	loadData = action(
		async (): Promise<void> => {
			this.data = await fetchLeaderBoardData(this.page, this.size);
		},
	);

	nextPage = action(() => {
		if (this.data && this.page < this.data.maxPage) {
			this.page += 1;
			this.loadData();
		}
	});

	prevPage = action(() => {
		if (this.data && this.page >= 1) {
			this.page -= 1;
			this.loadData();
		}
	});

	setPage = action((page: number) => {
		if (this.data && page >= 0 && page <= this.data.maxPage) {
			this.page = page;
			this.loadData();
		}
	});

	setSize = action((size: number) => {
		if (this.data) {
			this.page = 0;
			this.size = size;
			this.loadData();
		}
	});
}
