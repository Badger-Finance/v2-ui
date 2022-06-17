import { NetworkConfig } from '@badger-dao/sdk';
import { Web3Provider } from '@ethersproject/providers';
import { ThreeDRotationSharp } from '@material-ui/icons';
import { computed } from 'mobx';
import Web3Modal from 'web3modal';

import { getWeb3ModalProviders } from '../../config/wallets';
import { RootStore } from './RootStore';

export class WalletStore {
	private web3Modal: Web3Modal;
	private provider?: Web3Provider;

	constructor(private store: RootStore, config: NetworkConfig) {
		this.store = store;
		this.web3Modal = new Web3Modal({
			network: config.name,
			providerOptions: getWeb3ModalProviders(config),
			cacheProvider: true,
		});

		if (this.web3Modal.cachedProvider) {
			this.connect();
		}
	}

	@computed
	get isConnected(): boolean {
		return this.store.sdk.address !== undefined;
	}

	disconnect() {
		this.web3Modal.clearCachedProvider();
	}

	private async handleChainChanged(chainId: string) {
		await this.store.updateNetwork(Number(chainId));
		await this.handleAccountsChanged([]);
	}

	// ignore the accounts, web3 modal kekekeke
	private async handleAccountsChanged(_accounts: string[]) {
		if (this.provider) {
			await this.store.updateProvider(this.provider);
		}
	}

	async connect() {
		// set up whack web3 untyped (typoical) bullshit
		const provider = await this.web3Modal.connect();
		provider.on('chainChanged', this.handleChainChanged.bind(this));
		provider.on('accountsChanged', this.handleAccountsChanged.bind(this));
		await provider.enable();

		// extract information and pass it into our app, thank fuck
		const temporaryProvider = this.getLibrary(provider);
		const connectedNetwork = await temporaryProvider.getNetwork();
		await this.store.updateNetwork(connectedNetwork.chainId);
		await this.store.updateProvider(temporaryProvider);

		// sync it up
		this.store.network.syncUrlNetworkId();
	}

	private getLibrary(provider: any): Web3Provider {
		const library = new Web3Provider(
			provider,
			typeof provider.chainId === 'number'
				? provider.chainId
				: typeof provider.chainId === 'string'
				? parseInt(provider.chainId)
				: 'any',
		);
		library.pollingInterval = 15000;
		return library;
	}
}
