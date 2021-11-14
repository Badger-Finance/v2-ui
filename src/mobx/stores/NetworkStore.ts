import { GasPrices } from '@badger-dao/sdk';
import { DEBUG } from 'config/environment';
import { defaultNetwork } from 'config/networks.config';
import { DEFAULT_RPC } from 'config/rpc.config';
import { isRpcWallet } from 'config/wallets';
import { action, extendObservable } from 'mobx';
import { Network } from 'mobx/model/network/network';
import { RootStore } from 'mobx/RootStore';

export class NetworkStore {
	private store: RootStore;
	public network: Network;
	public gasPrices: GasPrices | null;
	public currentBlock: number;

	constructor(store: RootStore) {
		this.store = store;
		this.network = defaultNetwork;
		this.gasPrices = { rapid: 35, fast: 30, standard: 25, slow: 20 };
		this.currentBlock = 1;

		extendObservable(this, {
			network: this.network,
			currentBlock: this.currentBlock,
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
									chainId: `0x${network.id.toString(16)}`,
									chainName: network.name,
									nativeCurrency: {
										name: network.symbol.toUpperCase(),
										symbol: network.symbol.toLowerCase(),
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
		}
	});

	// Check to see if the wallet's connected network matches the currently defined network
	// if it doesn't, set to the proper network
	checkNetwork = action((network: number): boolean => {
		const { onboard } = this.store.onboard;
		// M50: Some onboard wallets don't have providers, we mock in the app network to fill in the gap here
		const walletState = onboard.getState();
		const walletName = walletState.wallet.name;
		if (!walletName) {
			return false;
		}

		// If this returns undefined, the network is not supported.
		const networkId = isRpcWallet(walletName) ? walletState.appNetworkId : network;
		const connectedNetwork = Network.networkFromId(networkId);

		if (!connectedNetwork) {
			this.store.uiState.queueNotification('Connecting to an unsupported network', 'error');
			onboard.walletReset();
			window.localStorage.removeItem('selectedWallet');
			return false;
		}

		if (connectedNetwork.id !== this.network.id) {
			this.network = connectedNetwork;
		}
		return true;
	});

	updateGasPrices = action(async () => {
		this.gasPrices = await this.store.api.loadGasPrices();
	});
}
