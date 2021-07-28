export interface Deploy {
	token: string;
	tokens: { [name: string]: string };
	geysers: { [name: string]: string };
	sett_system: SettSystem;
}

export interface SettSystem {
	vaults: { [name: string]: string };
}
