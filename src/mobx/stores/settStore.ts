import { extendObservable, action, observe } from 'mobx';
import { RootStore } from '../store';
import _ from 'lodash';
import async from 'async';
import { getAssetsUnderManagement, getCoinData, getAssetPerformances, getFarmData, getPpfs } from 'mobx/utils/api';
import { setts, diggSetts } from 'mobx/utils/setts';

/**
 * TODO: Clean this up, zero typing.
 */
class SettStore {
	private store!: RootStore;
	public assets?: any = {};
	public badger?: any = {};
	public setts?: any = [];
	public diggSetts?: any = [];
	public farmData?: any = {};
	public ppfs?: any = {};

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			assets: {},
			badger: {},
			setts: [],
			diggSetts: [],
			farmData: {},
			ppfs: {},
		});

		this.fetchSettData();
	}

	private _fetchingSettData = false;

	fetchSettData = action(() => {
		if (this._fetchingSettData) return;
		this._fetchingSettData = true;
		// TODO: Should this be parallel?
		async.series(
			[
				(callback: any) => this.fetchAssets(callback),
				(callback: any) => this.fetchBadger(callback),
				(callback: any) => this.fetchSetts(callback),
				(callback: any) => this.fetchDiggSetts(callback),
				(callback: any) => this.fetchFarmData(callback),
				(callback: any) => this.fetchPpfs(callback),
			],
			(_err: any, _result: any) => {
				this._fetchingSettData = false;
			},
		);
	});

	fetchBadger = action((callback: any) => {
		getCoinData('badger-dao').then((res: any) => {
			if (res) {
				this.badger = res;
			}
			callback();
		});
	});

	fetchAssets = action((callback: any) => {
		getAssetsUnderManagement().then((res: any) => {
			if (res) {
				this.assets = res;
			}
			callback();
		});
	});

	fetchSetts = action((callback: any) => {
		getAssetPerformances(setts).then((res: any) => {
			if (res) {
				this.setts = res;
			}
			callback();
		});
	});

	fetchDiggSetts = action((callback: any) => {
		getAssetPerformances(diggSetts).then((res: any) => {
			if (res) {
				this.diggSetts = res;
			}
			callback();
		});
	});

	fetchFarmData = action((callback: any) => {
		getFarmData().then((res: any) => {
			if (res) {
				this.farmData = res;
			}
			callback();
		});
	});

	fetchPpfs = action((callback: any) => {
		getPpfs().then((res: any) => {
			if (res) {
				this.ppfs = res;
			}
			callback();
		});
	});
}

export default SettStore;
