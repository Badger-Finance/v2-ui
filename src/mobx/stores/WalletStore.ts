import Web3Modal from 'web3modal';
import { RootStore } from '../RootStore';
import { getWeb3ModalProviders } from '../../config/wallets';
import { NetworkConfig } from '@badger-dao/sdk';
import { ethers } from 'ethers';
import { computed, extendObservable } from 'mobx';
import Web3 from 'web3';

export class WalletStore {
	private web3Modal: Web3Modal;
	private ethersWeb3Provider?: ethers.providers.Web3Provider;
	private web3?: Web3;
	private store: RootStore;
	private providerAddress?: string;
	private providerNetwork?: ethers.providers.Network;

	constructor(store: RootStore, config: NetworkConfig) {
		this.store = store;
		this.web3Modal = new Web3Modal({
			network: config.name,
			providerOptions: getWeb3ModalProviders(config),
			cacheProvider: true,
		});

		extendObservable(this, {
			providerAddress: this.providerAddress,
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
		return this.provider?.network.chainId;
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
		this.ethersWeb3Provider = undefined;
		this.web3Modal.clearCachedProvider();
	}

	private async handleChainChanged(chainId: number) {
		await this.store.updateNetwork(chainId);
		if (this.provider) {
			await this.store.updateProvider(this.provider);
		}
	}

	private async updateAppNetwork() {
		if (!this.ethersWeb3Provider || !this.providerNetwork) return;
		await this.store.updateNetwork(this.providerNetwork.chainId);
		await this.store.updateProvider(this.ethersWeb3Provider);
	}

	async connect() {
		const instance = await this.web3Modal.connect();
		const provider = new ethers.providers.Web3Provider(instance, 'any');
		const network = await provider.getNetwork();
		provider.on('chainChanged', this.handleChainChanged);
		provider.on('disconnect', this.disconnect);
		this.ethersWeb3Provider = provider;
		this.web3 = new Web3(instance);
		this.providerAddress = await provider.getSigner().getAddress();
		this.providerNetwork = network;
		await this.updateAppNetwork();
	}
}
