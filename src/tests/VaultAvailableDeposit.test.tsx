import { BigNumber } from 'ethers';
import React from 'react';

import { VaultAvailableDeposit } from '../components-v2/common/dialogs/VaultAvailableDeposit';
import { MAX } from '../config/constants';
import { TokenBalance } from '../mobx/model/tokens/token-balance';
import { checkSnapshot } from './utils/snapshots';

describe('VaultAvailableDeposit', () => {
  const normalCap = new TokenBalance(
    {
      address: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24',
      decimals: 18,
      name: '',
      symbol: '',
    },
    BigNumber.from('341319340751832806348'),
    1.52499515342814,
  );

  const maxCap = new TokenBalance(
    {
      address: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24',
      decimals: 18,
      name: '',
      symbol: '',
    },
    BigNumber.from(MAX),
    1.52499515342814,
  );

  it('displays deposit limits', () => {
    const mockCap = new TokenBalance(
      {
        address: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
        decimals: 9,
        symbol: 'DIGG',
        name: 'DIGG',
      },
      BigNumber.from('512014272658'),
      15.720585159535592,
    );

    checkSnapshot(
      <VaultAvailableDeposit
        vaultCapInfo={{
          vaultCap: mockCap,
          totalVaultCap: mockCap,
          userCap: mockCap,
          totalUserCap: mockCap,
          asset: 'DIGG',
        }}
      />,
    );
  });

  it('does not show user limits if limit is max cap', () => {
    const maxCap = new TokenBalance(
      {
        address: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24',
        decimals: 18,
        name: '',
        symbol: '',
      },
      BigNumber.from(MAX),
      1.52499515342814,
    );

    checkSnapshot(
      <VaultAvailableDeposit
        vaultCapInfo={{
          vaultCap: normalCap,
          totalVaultCap: normalCap,
          userCap: maxCap,
          totalUserCap: maxCap,
          asset: 'imBTC',
        }}
      />,
    );
  });

  it('does not show vault limits if limit is max cap', () => {
    checkSnapshot(
      <VaultAvailableDeposit
        vaultCapInfo={{
          vaultCap: maxCap,
          totalVaultCap: maxCap,
          userCap: normalCap,
          totalUserCap: normalCap,
          asset: 'imBTC',
        }}
      />,
    );
  });

  it('does not show any limits if both user and vault limits are max cap', () => {
    checkSnapshot(
      <VaultAvailableDeposit
        vaultCapInfo={{
          vaultCap: maxCap,
          totalVaultCap: maxCap,
          userCap: maxCap,
          totalUserCap: maxCap,
          asset: 'imBTC',
        }}
      />,
    );
  });
});