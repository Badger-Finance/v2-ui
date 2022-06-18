import { GasFees, GasPrices, GasSpeed, getNetworkConfig } from '@badger-dao/sdk';
import { DEBUG } from 'config/environment';
import { defaultNetwork } from 'config/networks.config';
import { DEFAULT_RPC } from 'config/rpc.config';
import { BigNumber } from 'ethers';
import { action, extendObservable, makeObservable, observable } from 'mobx';
import { Network } from 'mobx/model/network/network';
import { RootStore } from 'mobx/stores/RootStore';

import { NETWORK_IDS, NETWORK_IDS_TO_NAMES } from '../../config/constants';

export class NetworkStore {
	private store: RootStore;
	private txGasPrice?: GasFees | number;

	public network: Network;
	public gasPrices: GasPrices | null;

	constructor(store: RootStore) {
		this.store = store;
		this.network = defaultNetwork;
		this.gasPrices = { rapid: 35, fast: 30, standard: 25, slow: 20 };

		makeObservable(this, {
			network: observable,
			gasPrices: observable,
		});
	}

	get gasSpeed(): GasFees | number {
		const fallBackGasPrice = this.gasPrices ? this.gasPrices[GasSpeed.Fast] : 0;
		return this.txGasPrice ?? fallBackGasPrice;
	}

	setGasPrice(gasPrice: GasFees | number) {
		this.txGasPrice = gasPrice;
		if (typeof gasPrice === 'number') {
			window.localStorage.setItem(`${this.network.name}-selectedGasPrice`, gasPrice.toString());
		} else {
			window.localStorage.setItem(`${this.network.name}-selectedGasPrice`, JSON.stringify(gasPrice));
		}
	}

	setNetwork = action(async (id: number) => {
		const network = Network.networkFromId(id);
		if (!network) {
			throw new Error(`${network} is not a supported network!`);
		}
		// ethereum is just the injected provider (mm) as all chains are canonically ethereum
		const { ethereum } = window;
		// implementation details from:
		// https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
		if (ethereum && this.store.wallet.isConnected) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				await ethereum.request!({
					method: 'wallet_switchEthereumChain',
					params: [
						{
							chainId: `0x${network.id.toString(16)}`,
						},
					],
				});
			} catch (err) {
				if (err.code === 4001) {
					throw new Error('User rejected request');
				}
				// This error code indicates that the chain has not been added to MetaMask.
				if (err.code === 4902) {
					try {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						await ethereum.request!({
							method: 'wallet_addEthereumChain',
							params: [
								{
									chainId: BigNumber.from(network.id).toHexString(),
									chainName: network.name,
									nativeCurrency: {
										name: network.name,
										symbol: network.currency,
										decimals: 18,
									},
									rpcUrls: [DEFAULT_RPC[network.symbol]],
									blockExplorerUrls: [network.explorer],
								},
							],
						});
					} catch {
						if (DEBUG) {
							console.error(
								`${network.name} misconfigured, please update network configuartion parameters.`,
							);
						}
						throw err;
					}
				}
			}
		}
		this.network = network;
		if (!this.store.wallet.isConnected) {
			await this.store.updateNetwork(network.id);
		} else {
			this.store.rewards.resetRewards();
		}
	});

	updateGasPrices = action(async () => {
		this.gasPrices = await this.store.sdk.api.loadGasPrices();
	});

	syncUrlNetworkId = action(() => {
		const {
			router,
			network: networkStore,
			sdk: { config },
		} = this.store;
		const chainId = config.chainId;
		const chain = router.queryParams?.chain;

		if (chain && chain !== chainId) {
			const fallBackParams = {
				...router.queryParams,
				chain: NETWORK_IDS_TO_NAMES[chainId as NETWORK_IDS],
			};
			try {
				const networkConfig = getNetworkConfig(String(chain));
				// purposely not awaiting this to not block the onboarding process
				networkStore
					.setNetwork(networkConfig.chainId)
					.then()
					.catch(() => {
						router.queryParams = fallBackParams;
					});
			} catch (e) {
				router.queryParams = fallBackParams;
			}
		}
	});
}
