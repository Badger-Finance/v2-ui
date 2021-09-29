import { Currency } from 'config/enums/currency.enum';
import { defaultNetwork } from 'config/networks.config';
import { DEFAULT_RPC } from 'config/rpc.config';
import { isRpcWallet } from 'config/wallets';
import { action, extendObservable, observe } from 'mobx';
import { Network } from 'mobx/model/network/network';
import { GasPrices } from 'mobx/model/system-config/gas-prices';
import { RootStore } from 'mobx/RootStore';
import Web3 from 'web3';

export class NetworkStore {
	private store: RootStore;
	public network: Network;
	public gasPrices: GasPrices | null;
	public currentBlock: number;

	constructor(store: RootStore) {
		this.store = store;
		this.network = defaultNetwork;
		this.gasPrices = { standard: 25 };
		this.currentBlock = 1;

		extendObservable(this, {
			network: this.network,
			currentBlock: this.currentBlock,
			gasPrices: this.gasPrices,
		});

		observe(this, 'network', async () => {
			// whenever network changes reset currency back to default usd
			this.store.uiState.currency = Currency.USD;
			await this.updateGasPrices();
		});
	}

	setNetwork = action(async (network: string) => {
		await this.verifyUserNetwork(network);
		await this.store.walletRefresh();
	});

	// Check to see if the wallet's connected network matches the currently defined network
	// if it doesn't, set to the proper network
	checkNetwork = action((network: number): boolean => {
		const { onboard } = this.store.wallet;
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
			console.log(`New netowrk: ${this.network.id}`);
		}
		return true;
	});

	updateGasPrices = action(async () => {
		this.gasPrices = await this.network.updateGasPrices();
	});

	getCurrentBlock = action(async () => {
		const provider = this.store.wallet.provider;
		if (!provider) {
			return;
		}
		const web3 = new Web3(provider);
		this.currentBlock = await web3.eth.getBlockNumber();
	});

	updateNetwork(): Promise<void[]> {
		return Promise.all([this.updateGasPrices(), this.getCurrentBlock()]);
	}

	private verifyUserNetwork = action(async (symbol: string) => {
		const network = Network.networkFromSymbol(symbol);
		// ethereum is just the injected provider (mm) as all chains are canonically ethereum
		const { ethereum } = window;
		if (ethereum) {
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
		}
		this.network = network;
	});
}
