export interface Deploy {
  token: string;
  tokens: { [name: string]: string };
  geysers: { [name: string]: string };
  sett_system: VaultSystem;
  citadel?: { [name: string]: string };
}

export interface VaultSystem {
  vaults: { [name: string]: string };
  strategies: { [name: string]: string };
}
