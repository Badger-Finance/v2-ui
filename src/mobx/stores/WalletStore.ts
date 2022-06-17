import { NetworkConfig } from '@badger-dao/sdk';
import { ethers } from 'ethers';
import { computed, extendObservable } from 'mobx';
import Web3 from 'web3';
import Web3Modal from 'web3modal';

import { getWeb3ModalProviders } from '../../config/wallets';
import { RootStore } from './RootStore';

export class WalletStore {
	private store: RootStore;
	private web3Modal: Web3Modal;
	private ethersWeb3Provider?: ethers.providers.Web3Provider;
	private web3?: Web3;
	private providerAddress?: string;
	private providerNetwork?: ethers.providers.Network;
	private providerChainId?: number;

	constructor(store: RootStore, config: NetworkConfig) {
		this.store = store;
		this.web3Modal = new Web3Modal({
			network: config.name,
			providerOptions: getWeb3ModalProviders(config),
			cacheProvider: true,
		});

		extendObservable(this, {
			web3: this.web3,
			providerNetwork: this.providerNetwork,
			ethersWeb3Provider: this.ethersWeb3Provider,
			providerAddress: this.providerAddress,
			providerChainId: this.providerChainId,
		});

		if (this.web3Modal.cachedProvider) {
			this.connect();
		}
	}

	@computed
	get isConnected(): boolean {
		return this.providerAddress !== undefined;
	}

	@computed
	get address() {
		return this.providerAddress;
	}

	@computed
	get chainId() {
		return this.providerChainId;
	}

	@computed
	get provider() {
		return this.ethersWeb3Provider;
	}

	@computed
	get web3Instance() {
		return this.web3;
	}

	disconnect() {
		this.providerAddress = undefined;
		this.providerChainId = undefined;
		this.ethersWeb3Provider = undefined;
		this.web3Modal.clearCachedProvider();
	}

	private async handleChainChanged(chainId: string) {
		this.providerChainId = Number(chainId);
		await this.store.updateNetwork(Number(chainId));
		if (this.provider) {
			await this.store.updateProvider(this.provider);
		}
	}

	private async handleAccountsChanged(accounts: string[]) {
		this.providerAddress = accounts[0];
		if (this.provider) {
			await this.store.updateProvider(this.provider);
		}
	}

	private async updateAppNetwork() {
		this.store.network.syncUrlNetworkId();
		if (!this.ethersWeb3Provider || !this.providerNetwork) return;
		await this.store.updateNetwork(this.providerNetwork.chainId);
		await this.store.updateProvider(this.ethersWeb3Provider);
	}

	async connect() {
		const instance = await this.web3Modal.connect();
		instance.on('chainChanged', this.handleChainChanged.bind(this));
		instance.on('accountsChanged', this.handleAccountsChanged.bind(this));
		await instance.enable();
		const provider = new ethers.providers.Web3Provider(instance, 'any');
		const network = await provider.getNetwork();
		this.ethersWeb3Provider = provider;
		this.web3 = new Web3(instance);
		this.providerAddress = await provider.getSigner().getAddress();
		this.providerNetwork = network;
		this.providerChainId = network.chainId;
		await this.updateAppNetwork();
	}
}
