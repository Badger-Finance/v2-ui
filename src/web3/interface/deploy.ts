export interface Deploy {
	tokens: { [name: string]: string };
	geysers: { [name: string]: string };
	sett_system: SettSystem;
}

export interface EthDeploy extends Deploy {
	digg_system: DiggSystem;
}

export interface SettSystem {
	vaults: { [name: string]: string };
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
