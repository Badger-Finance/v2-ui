import { action } from 'mobx';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import NetworkGasWidget from '../components-v2/common/NetworkGasWidget';
import { defaultNetwork, supportedNetworks } from '../config/networks.config';
import GasPricesStore from '../mobx/stores/GasPricesStore';
import store from '../mobx/stores/RootStore';
import { createMatchMedia, customRender, fireEvent, screen } from './Utils';

const mockGasPrices = {
  rapid: {
    maxPriorityFeePerGas: 2,
    maxFeePerGas: 85.945524054,
  },
  fast: {
    maxPriorityFeePerGas: 2,
    maxFeePerGas: 77.35097164860001,
  },
  standard: {
    maxPriorityFeePerGas: 2,
    maxFeePerGas: 68.7564192432,
  },
  slow: {
    maxPriorityFeePerGas: 2,
    maxFeePerGas: 60.1618668378,
  },
};

describe('NetworkGasWidget', () => {
  beforeEach(() => {
    jest
      .spyOn(GasPricesStore.prototype, 'initialized', 'get')
      .mockReturnValue(true);
    jest
      .spyOn(GasPricesStore.prototype, 'getGasPrices')
      .mockReturnValue(mockGasPrices);
  });

  it('displays network options', () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <NetworkGasWidget />
      </StoreProvider>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'open network selector' }),
    );
    fireEvent.mouseOver(screen.getByText(defaultNetwork.name));
    expect(baseElement).toMatchSnapshot();
  });

  it('can select a network', () => {
    const mockSelectNetwork = jest.fn();
    store.network.setNetwork = action(mockSelectNetwork);

    customRender(
      <StoreProvider value={store}>
        <NetworkGasWidget />
      </StoreProvider>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'open network selector' }),
    );
    fireEvent.click(screen.getByText(supportedNetworks[2].name));
    expect(mockSelectNetwork).toHaveBeenNthCalledWith(
      1,
      supportedNetworks[2].id,
    );
  });

  describe('in desktop mode', () => {
    it('can select gas options', () => {
      const mockSetGasPrice = jest.fn();
      store.network.setGasPrice = action(mockSetGasPrice);

      customRender(
        <StoreProvider value={store}>
          <NetworkGasWidget />
        </StoreProvider>,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'open network selector' }),
      );
      fireEvent.mouseOver(screen.getByText(defaultNetwork.name));
      fireEvent.click(
        screen.getByText((mockGasPrices.rapid.maxFeePerGas / 2).toFixed(0)),
      );
      expect(mockSetGasPrice).toHaveBeenNthCalledWith(1, mockGasPrices.rapid);
    });
  });

  describe('in mobile mode', () => {
    it('can select gas options', () => {
      const mockSetGasPrice = jest.fn();
      store.network.setGasPrice = action(mockSetGasPrice);
      window.matchMedia = createMatchMedia(480);

      customRender(
        <StoreProvider value={store}>
          <NetworkGasWidget />
        </StoreProvider>,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'open network selector' }),
      );
      fireEvent.click(
        screen.getAllByRole('button', { name: 'show gas options' })[0],
      );
      fireEvent.click(
        screen.getByText((mockGasPrices.rapid.maxFeePerGas / 2).toFixed(0)),
      );
      expect(mockSetGasPrice).toHaveBeenNthCalledWith(1, mockGasPrices.rapid);
    });
  });
});
