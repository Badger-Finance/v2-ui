import { YieldBearingVaultConfig, YieldBearingVaultSource } from 'mobx/model/vaults/yield-bearing-vault-data';

export function getYieldBearingVaultBySourceName(name: string): YieldBearingVaultSource | undefined {
  return yieldBearingVaultConfig.vaults.find((v) => v.name === name);
}

export const yieldBearingVaultConfig: YieldBearingVaultConfig = {
  vaults: [
    {
      name: 'Gravitationally Bound AURA',
      token: 'AURA',
      vaultId: '0xBA485b556399123261a5F9c95d413B4f93107407',
      vaultName: 'graviAURA',
      vaultDescription: 'Yield-Bearing Locked AURA',
      route: 'aura-graviaura',
    },
    {
      name: 'Badger Sett Aura BAL',
      token: 'BAL',
      vaultId: '0x37d9D2C6035b744849C15F1BFEE8F268a20fCBd8',
      vaultName: 'bauraBAL',
      vaultDescription: 'Yield-Bearing Staked auraBAL',
      route: 'aura-aurabal',
    },
    {
      name: 'Badger Sett Convex CRV',
      token: 'CRV',
      vaultId: '0x2B5455aac8d64C14786c3a29858E43b5945819C0',
      vaultName: 'bcvxCRV',
      vaultDescription: 'Yield-Bearing Staked cvxCRV',
      route: 'convex-cvxcrv',
    },
    {
      name: 'Badger Vested Escrow Convex Token',
      token: 'CVX',
      vaultId: '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
      vaultName: 'bveCVX',
      vaultDescription: 'Yield-Bearing Locked CVX',
      route: 'convex-bvecvx',
    },
  ],
};
