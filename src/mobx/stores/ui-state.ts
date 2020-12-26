import async from 'async';
import BigNumber from 'bignumber.js';
import _, { times } from 'lodash';
import { extendObservable, action, observe, computed } from 'mobx';
import Web3 from 'web3';
import { collections } from '../../config/constants';
import { RootStore } from '../store';
import { growthQuery, jsonQuery, secondsToBlocks } from '../utils/helpers';
import { reduceClaims, reduceContractsToStats, reduceGeysersToStats, reduceVaultsToStats } from '../utils/stats-reducers';
import views from '../../config/routes';

class UiState {
	private store!: RootStore

	public currency!: string
	public period!: string

	public errorMessage?: String;
	public collection?: any;
	public vault?: string;

	public stats?: any;
	public vaultStats: any
	public geyserStats: any

	public sidebarOpen!: boolean
	public notification: any = {}
	public gasPrice?: number

	public txStatus?: string


	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			errorMessage: undefined,
			collection: undefined,
			vault: undefined,
			stats: {
				tvl: '...',
				growth: '...',
				portfolio: '...',
				_vaultGrowth: {},
				claims: [0, 0],
			},
			geyserStats: {},
			vaultStats: {},

			currency: 'eth',
			period: 'year',

			sidebarOpen: !!window && window.innerWidth > 960,
			notification: {},
			gasPrice: 0,
			txStatus: undefined
		});

		observe(this.store.contracts as any, "geysers", (change: any) => {
			// skip first update
			if (!!change.oldValue) {
				this.reduceContracts()
			}
		})
		observe(this.store.contracts as any, "vaults", (change: any) => {
			// skip first update
			if (!!change.oldValue) {
				this.reduceContracts()
			}
		})
		observe(this.store.contracts as any, "tokens", (change: any) => {
			// skip first update
			if (!!change.oldValue) {
				this.reduceContracts()
			}
		})
		observe(this.store.wallet as any, "currentBlock", (change: any) => {
			this.reduceContracts()
			this.fetchSettRewards()
		})
		observe(this.store.wallet as any, "gasPrices", (change: any) => {
			if (!this.gasPrice)
				this.gasPrice = this.store.wallet.gasPrices.fast
		})
		observe(this.store.wallet as any, "provider", (change: any) => {
			this.fetchSettRewards()
			this.store.router.goTo(views.home)
		})
		observe(this as any, "period", (change: any) => {
			this.reduceContracts()
		})
		observe(this as any, "currency", (change: any) => {
			this.reduceContracts()
		})


		window.onresize = () => {
			if (window.innerWidth < 960) {
				this.sidebarOpen = false
			} else {
				this.sidebarOpen = true
			}
		}
	}

	queueNotification = action((message: string, variant: string) => {
		this.notification = { message, variant }
	})

	setTxStatus = action((status?: string) => {
		this.txStatus = status
	})

	reduceContracts = action(() => {

		this.geyserStats = reduceGeysersToStats(this.store)
		this.vaultStats = reduceVaultsToStats(this.store)

		this.stats = {
			...this.stats,
			...reduceContractsToStats(this.store)
		}


	});
	setCollection = action((id: string) => {
		if (!!this.collection && this.collection.id === id)
			return

		this.collection = collections.find((collection) => collection.id === id)
		this.store?.contracts.fetchCollection() //TODO:observe ui from collections
		this.fetchSettRewards()

	});


	fetchSettRewards = action(() => {
		const { walletState, provider } = this.store.wallet
		const { merkle, proofNetwork, tokens } = this.collection.configs.geysers.rewards
		if (!walletState?.address)
			return

		let web3 = new Web3(provider)
		let rewardsTree = new web3.eth.Contract(merkle.abi, merkle.hashContract)
		let checksumAddress = Web3.utils.toChecksumAddress(walletState?.address)

		rewardsTree.methods
			.merkleContentHash()
			.call()
			.then((merkleHash: any) => {
				jsonQuery(`${merkle.proofEndpoint}/rewards/${merkle.proofNetwork}/${merkleHash}/${checksumAddress}`)
					.then((merkleProof: any) => {
						if (!merkleProof.error) {
							rewardsTree.methods.getClaimedFor(walletState?.address, tokens)
								.call()
								.then((claimedRewards: any[]) => {
									let claims = reduceClaims(merkleProof, claimedRewards)
									this.stats = {
										...this.stats,
										cycle: parseInt(merkleProof.cycle, 16),
										claims
									}
								})
						}
					})

			})

	});


	setVault = action((collection: string, id: string) => {
		this.vault = id
		this.setCollection(collection)
	});

	setGasPrice = action((gasPrice: number) => {
		this.gasPrice = gasPrice
	});

	setCurrency = action((currency: string) => {
		this.currency = currency
	});
	setPeriod = action((period: string) => {
		this.period = period
	});
	openSidebar = action(() => {
		this.sidebarOpen = true
	});
	closeSidebar = action(() => {
		this.sidebarOpen = false
	});



	// UI
	// addFilter = action((filter: string) => {
	// 	this.collection.config.config.table.push(filter)
	// });
	// removeFilter = action((filter: string) => {
	// 	this.collection.config.config.table = this.collection.config.config.table.filter((item: string) => item != filter)
	// });
	// addAction = action((method: string) => {
	// 	this.collection.config.config.actions.push(method)
	// });
	// removeAction = action((method: string) => {
	// 	this.collection.config.config.actions = this.collection.config.config.actions.filter((item: string) => item != method)
	// });

}

export default UiState;


