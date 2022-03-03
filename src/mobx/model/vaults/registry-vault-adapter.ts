import {
	RegistryVault,
	Vault,
	BoostConfig,
	BouncerType,
	Protocol,
	TokenBalance,
	ValueSource,
	VaultState,
	VaultStrategy,
	VaultType,
} from '@badger-dao/sdk';

export class RegistryVaultAdapter implements Vault {
	// eslint-disable-next-line no-restricted-globals
	name: string;
	value: number;
	available: number;
	balance: number;
	asset: string;
	vaultAsset: string;
	boost: BoostConfig;
	bouncer: BouncerType;
	apr: number;
	apy: number;
	minApr?: number;
	maxApr?: number;
	minApy?: number;
	maxApy?: number;
	pricePerFullShare: number;
	protocol: Protocol;
	sources: ValueSource[];
	sourcesApy: ValueSource[];
	state: VaultState;
	tokens: TokenBalance[];
	underlyingToken: string;
	vaultToken: string;
	strategy: VaultStrategy;
	type: VaultType;

	constructor(registryVault: RegistryVault) {
		this.vaultToken = registryVault.address;
		this.underlyingToken = registryVault.token.address;
		this.name = registryVault.name;
		this.available = registryVault.available;
		this.balance = registryVault.balance;
		this.pricePerFullShare = registryVault.pricePerFullShare;
		this.asset = registryVault.token.symbol;
		this.vaultAsset = registryVault.symbol;
		this.state = registryVault.state;

		// TODO: check if we can have more default values
		this.value = 0;
		this.protocol = Protocol.Badger;
		this.tokens = [];
		this.sources = [];
		this.sourcesApy = [];
		this.type = VaultType.Native;
		this.bouncer = BouncerType.None;
		this.apr = 0;
		this.apy = 0;
		this.boost = {
			weight: 0,
			enabled: false,
		};
		this.strategy = {
			withdrawFee: 0,
			strategistFee: 0,
			address: '',
			performanceFee: 0,
		};
	}
}
