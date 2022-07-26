import '@testing-library/jest-dom';

import { parseEther } from 'ethers/lib/utils';
import { Chain } from 'mobx/model/network/chain';
import React from 'react';

import { BadgerAPI, Network } from '../../../sdk';
import { TokenBalance } from '../mobx/model/tokens/token-balance';
import store from '../mobx/stores/RootStore';
import Landing from '../pages/Landing';
import { createMatchMedia } from './Utils';
import { SAMPLE_VAULTS } from './utils/samples';
import { checkSnapshot } from './utils/snapshots';

describe('Landing', () => {
  beforeEach(() => {
    store.prices.getPrice = jest.fn().mockReturnValue(1500);
    Chain.getChain(store.chain.network).deploy.token = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
    store.wallet.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
    store.user.accountDetails = {
      address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
      value: 0,
      earnedValue: 0,
      data: {},
      boost: 1,
      boostRank: 251,
      nativeBalance: 100,
      nonNativeBalance: 10,
      stakeRatio: 100,
      claimableBalances: {},
      nftBalance: 0,
      bveCvxBalance: 0,
      diggBalance: 10,
    };

    store.vaults.initialized = true;

    store.user.balances = {
      '0x3472A5A71965499acd81997a54BBA8D852C6E53d': new TokenBalance(
        {
          address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
          name: 'Badger',
          symbol: 'BADGER',
          decimals: 18,
        },
        parseEther('100'),
        3.7,
      ),
      '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305': new TokenBalance(
        {
          address: '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
          name: 'Badger Vested Escrow Convex Token',
          symbol: 'bveCVX',
          decimals: 18,
        },
        parseEther('1000'),
        6.45,
      ),
      '0x2B5455aac8d64C14786c3a29858E43b5945819C0': new TokenBalance(
        {
          address: '0x2B5455aac8d64C14786c3a29858E43b5945819C0',
          name: 'Badger Sett Convex CRV',
          symbol: 'bcvxCRV',
          decimals: 18,
        },
        parseEther('1000'),
        1.7123657857388648,
      ),
    };

    jest.spyOn(BadgerAPI.prototype, 'loadProtocolSummary').mockImplementation(() =>
      Promise.resolve({
        totalValue: 0,
        setts: [],
      }),
    );

    store.vaults.vaultCache = {
      [Network.Ethereum]: Object.fromEntries(SAMPLE_VAULTS.map((vault) => [vault.vaultToken, vault])),
    };
  });

  test('Renders correctly', async () => {
    checkSnapshot(<Landing />);
  });

  test('Renders tablet version correctly', () => {
    window.matchMedia = createMatchMedia(900);
    checkSnapshot(<Landing />);
  });

  test('Renders mobile version correctly', () => {
    window.matchMedia = createMatchMedia(480);
    checkSnapshot(<Landing />);
  });
});
