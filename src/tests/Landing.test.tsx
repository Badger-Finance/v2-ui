import '@testing-library/jest-dom';

import UserStore from 'mobx/stores/UserStore';
import React from 'react';

import store from '../mobx/stores/RootStore';
import VaultStore from '../mobx/stores/VaultStore';
import { WalletStore } from '../mobx/stores/WalletStore';
import Landing from '../pages/Landing';
import { createMatchMedia } from './Utils';
import { SAMPLE_VAULTS } from './utils/samples';
import { checkSnapshot } from './utils/snapshots';

describe('Landing', () => {
  beforeEach(() => {
    store.prices.getPrice = jest.fn().mockReturnValue(1500);
    store.network.network.deploy.token = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
    jest.spyOn(WalletStore.prototype, 'isConnected', 'get').mockReturnValue(true);
    jest.spyOn(WalletStore.prototype, 'address', 'get').mockReturnValue('0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a');
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

    jest.spyOn(UserStore.prototype, 'portfolioValue', 'get').mockReturnValue(1000);
    jest.spyOn(VaultStore.prototype, 'vaultOrder', 'get').mockReturnValue(SAMPLE_VAULTS);
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
