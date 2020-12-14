import { extendObservable, action } from 'mobx';

class UiStore {

	public filters?: string[];


	constructor() {
		// const seaport = new OpenSeaPort(provider, {
		// 	networkName: Network.Main
		// })

		extendObservable(this, {
			filters: undefined
		});
	}

	setFilters = action((filters: string[]) => {
		this.filters = filters;
	});


}

export default UiStore;