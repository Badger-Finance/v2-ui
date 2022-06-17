import { RootStore } from '../../stores/RootStore';

export class Contract {
	store!: RootStore;
	public address!: string;

	constructor(store: RootStore, address: string) {
		this.store = store;
		this.address = address;
	}
}
