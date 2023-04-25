import { Chain } from 'mobx/model/network/chain';
import React from 'react';

import Navbar from '../components-v2/navbar';
import store from '../mobx/stores/RootStore';
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
    Chain.getChain(store.chain.network).deploy.token = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
    store.wallet.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
    store.prices.getPrice = jest.fn().mockReturnValue(80);
    store.tree.cycle = 5894;
    store.tree.lastUpdate = '0h 55m';
    store.vaults.protocolSummaryCache = {
      [store.chain.network]: {
        totalValue: 1_000_000,
        setts: [],
      },
    };
    store.router = {
      ...store.router,
      currentRoute: {
        path: '/',
        originalPath: '/',
        rootPath: '/',
        replaceUrlParams: jest.fn(),
        getRootPath: jest.fn(),
        getParamsObject: jest.fn(),
        component: React.createElement('div'),
      },
      goTo: jest.fn(),
      currentPath: '/',
    };
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
