import { GasPrices } from '@badger-dao/sdk';
import { DEBUG } from 'config/environment';
import { defaultNetwork } from 'config/networks.config';
import { DEFAULT_RPC } from 'config/rpc.config';
import { BigNumber } from 'ethers';
import { action, extendObservable } from 'mobx';
import { Network } from 'mobx/model/network/network';
import { RootStore } from 'mobx/RootStore';

export class NetworkStore {
	private store: RootStore;
	public network: Network;
	public gasPrices: GasPrices | null;

	constructor(store: RootStore) {
		this.store = store;
		this.network = defaultNetwork;
		this.gasPrices = { rapid: 35, fast: 30, standard: 25, slow: 20 };

		extendObservable(this, {
			network: this.network,
			gasPrices: this.gasPrices,
		});
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
		if (ethereum && this.store.onboard.isActive()) {
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
					}
				}
			}
		}
		this.network = network;
		if (!this.store.onboard.isActive()) {
			await this.store.updateNetwork(network.id);
		} else {
			this.store.rewards.resetRewards();
		}
	});

	updateGasPrices = action(async () => {
		this.gasPrices = await this.store.sdk.api.loadGasPrices();
	});
}
