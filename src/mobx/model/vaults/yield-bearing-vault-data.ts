export interface YieldBearingVaultConfig {
  vaults: YieldBearingVaultSource[];
}

export interface YieldBearingVaultSource {
  name: string;
  token: string;
  vaultId: string;
  vaultName: string;
  vaultDescription: string;
}
