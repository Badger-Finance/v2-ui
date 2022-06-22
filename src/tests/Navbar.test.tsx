import { BigNumber } from 'ethers';
import { RouterStore } from 'mobx-router';
import React from 'react';

import Navbar from '../components-v2/navbar';
import PricesStore from '../mobx/stores/PricesStore';
import store from '../mobx/stores/RootStore';
import UserStore from '../mobx/stores/UserStore';
import VaultStore from '../mobx/stores/VaultStore';
import { WalletStore } from '../mobx/stores/WalletStore';
import { createMatchMedia } from './Utils';
import { checkSnapshot } from './utils/snapshots';

/* eslint-disable */

class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

describe('Navbar', () => {
  beforeEach(() => {
    global.ResizeObserver = ResizeObserver;
    store.network.network.deploy.token =
      '0x3472A5A71965499acd81997a54BBA8D852C6E53d';

    jest
      .spyOn(WalletStore.prototype, 'isConnected', 'get')
      .mockReturnValue(true);
    jest
      .spyOn(WalletStore.prototype, 'address', 'get')
      .mockReturnValue('0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a');

    jest
      .spyOn(RouterStore.prototype, 'currentPath', 'get')
      .mockReturnValue('/');
    jest
      .spyOn(UserStore.prototype, 'portfolioValue', 'get')
      .mockReturnValue(10_000);
    jest.spyOn(PricesStore.prototype, 'getPrice').mockReturnValue(80);
    jest.spyOn(VaultStore.prototype, 'protocolSummary', 'get').mockReturnValue({
      totalValue: 1_000_000,
      setts: [],
    });
  });

  test('Renders correctly', async () => {
    checkSnapshot(<Navbar />);
  });

  test('Renders tablet version correctly', () => {
    window.matchMedia = createMatchMedia(900);
    checkSnapshot(<Navbar />);
  });

  test('Renders mobile version correctly', () => {
    window.matchMedia = createMatchMedia(480);
    checkSnapshot(<Navbar />);
  });
});
