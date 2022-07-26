import '@testing-library/jest-dom';

import * as copy from 'copy-to-clipboard';
import { utils } from 'ethers';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import WalletDrawer from '../components-v2/common/WalletDrawer';
import deploy from '../config/deployments/mainnet.json';
import { TokenBalance } from '../mobx/model/tokens/token-balance';
import store from '../mobx/stores/RootStore';
import UserStore from '../mobx/stores/UserStore';
import { customRender, fireEvent, screen } from './Utils';

jest.mock('copy-to-clipboard', () => {
  return jest.fn().mockReturnValue(true);
});

describe('Wallet Drawer', () => {
  beforeEach(() => {
    store.uiState.showWalletDrawer = true;
    store.wallet.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
    jest.spyOn(UserStore.prototype, 'getBalance').mockImplementation((token) => {
      if (token === deploy.tokens.badger) {
        return new TokenBalance(
          {
            address: deploy.tokens.badger,
            name: 'Badger',
            symbol: 'Badger',
            decimals: 18,
          },
          utils.parseEther('1000'),
          80,
        );
      } else if (token === deploy.tokens.digg) {
        return new TokenBalance(
          {
            address: deploy.tokens.digg,
            name: 'Digg',
            symbol: 'DIGG',
            decimals: 8,
          },
          utils.parseEther('0.1'),
          50000,
        );
      } else {
        return new TokenBalance(
          {
            address: deploy.tokens.remdigg,
            name: 'remDigg',
            symbol: 'remDIGG',
            decimals: 8,
          },
          utils.parseEther('0.1'),
          50000,
        );
      }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays correctly', () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <WalletDrawer />
      </StoreProvider>,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('disconnects wallet', async () => {
    const disconnectSpy = jest.fn();
    store.wallet.disconnect = disconnectSpy;
    jest.useFakeTimers();
    customRender(
      <StoreProvider value={store}>
        <WalletDrawer />
      </StoreProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'disconnect wallet' }));
    jest.runAllTimers();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('copies wallet address', () => {
    jest.spyOn(copy, 'default').mockReturnValue(true);

    customRender(
      <StoreProvider value={store}>
        <WalletDrawer />
      </StoreProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'copy wallet address' }));
    expect(screen.getByText('Wallet Address Copied')).toBeInTheDocument();
  });

  it('dismisses copied wallet address message', () => {
    jest.spyOn(copy, 'default').mockReturnValue(true);

    customRender(
      <StoreProvider value={store}>
        <WalletDrawer />
      </StoreProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'copy wallet address' }));
    fireEvent.click(screen.getByRole('button', { name: 'dismiss copied address message' }));
    expect(screen.queryByText('Wallet Address Copied')).not.toBeInTheDocument();
  });
});
