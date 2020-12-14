import { RouterStore } from 'mobx-router';
import AppStore from './stores/app-store';

export class RootStore {
	public router: RouterStore<RootStore>;
	public app: AppStore;

	constructor() {
		this.router = new RouterStore<RootStore>(this);
		this.app = new AppStore();
	}
}

const store = new RootStore();

export default store;