import {
	RegistryVault,
	VaultDTO,
	BoostConfig,
	BouncerType,
	Protocol,
	TokenBalance,
	ValueSource,
	VaultState,
	VaultStrategy,
	VaultType,
	VaultBehavior,
	TokenValue,
	VaultVersion,
} from '@badger-dao/sdk';
// TODO: sadge export
import { VaultYieldProjection } from '@badger-dao/sdk/lib/api/interfaces/vault-yield-projection.interface';

export class RegistryVaultAdapter implements VaultDTO {
	apr: number;
	apy: number;
	asset: string;
	available: number;
	balance: number;
	behavior: VaultBehavior;
	boost: BoostConfig;
	bouncer: BouncerType;
	lastHarvest: number;
	maxApr?: number;
	maxApy?: number;
	minApr?: number;
	minApy?: number;
	// eslint-disable-next-line no-restricted-globals
	name: string;
	pricePerFullShare: number;
	protocol: Protocol;
	sources: ValueSource[];
	sourcesApy: ValueSource[];
	state: VaultState;
	strategy: VaultStrategy;
	tokens: TokenValue[];
	type: VaultType;
	underlyingToken: string;
	value: number;
	vaultAsset: string;
	vaultToken: string;
	version: VaultVersion;
	yieldProjection: VaultYieldProjection;

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
		this.behavior = VaultBehavior.None;
		this.version = VaultVersion.v1;
		this.yieldProjection = {
			yieldApr: 0,
			yieldTokens: [],
			yieldValue: 0,
			harvestApr: 0,
			harvestApy: 0,
			harvestTokens: [],
			harvestValue: 0,
		};
		this.lastHarvest = Date.now();
	}
}
