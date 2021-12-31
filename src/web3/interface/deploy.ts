export interface Deploy {
	token: string;
	tokens: { [name: string]: string };
	geysers: { [name: string]: string };
	sett_system: VaultSystem;
}

export interface EthDeploy extends Deploy {
	digg_system: DiggSystem;
}

export interface VaultSystem {
	vaults: { [name: string]: string };
	strategies: { [name: string]: string };
}

export interface DiggSystem {
	DROPT: {
		[variant: string]: {
			longToken: string;
			shortToken: string;
			redemption: string;
		};
	};
}
