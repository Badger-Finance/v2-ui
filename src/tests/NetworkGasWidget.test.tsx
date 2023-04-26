import '@testing-library/jest-dom';

import { BadgerAPI } from '@badger-dao/sdk';
import { action } from 'mobx';
import { Chain } from 'mobx/model/network/chain';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import NetworkGasWidget from '../components-v2/common/NetworkGasWidget';
import { defaultNetwork, supportedNetworks } from '../config/networks.config';
import GasPricesStore from '../mobx/stores/GasPricesStore';
import store from '../mobx/stores/RootStore';
import { getNetworkIconPath } from '../utils/network-icon';
import { customRender, fireEvent, screen } from './Utils';

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

function addSpies() {
  jest.spyOn(BadgerAPI.prototype, 'loadVaults').mockReturnValue(Promise.resolve([]));
  jest.spyOn(GasPricesStore.prototype, 'initialized', 'get').mockReturnValue(true);
  jest.spyOn(GasPricesStore.prototype, 'getGasPrices').mockReturnValue(mockGasPrices);
}

describe('NetworkGasWidget', () => {
  const expectedChain = Chain.getChain(defaultNetwork);

  beforeEach(addSpies);

  it('displays network options', () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <NetworkGasWidget />
      </StoreProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'open network selector' }));
    fireEvent.mouseOver(screen.getByText(expectedChain.name));
    expect(baseElement).toMatchSnapshot();
  });

  it('can select a network', async () => {
    customRender(
      <StoreProvider value={store}>
        <NetworkGasWidget />
      </StoreProvider>,
    );

    const networkIcon = screen.getByAltText('selected network icon');
    fireEvent.click(screen.getByRole('button', { name: 'open network selector' }));
    fireEvent.click(screen.getByText(supportedNetworks[2].name));
    await screen.findByText(supportedNetworks[2].name);
    expect(networkIcon).toHaveAttribute('src', getNetworkIconPath(supportedNetworks[2].network));
  });

  describe('in desktop mode', () => {
    beforeEach(addSpies);

    it('can select gas options', () => {
      const mockSetGasPrice = jest.fn();
      store.chain.setGasPrice = action(mockSetGasPrice);

      customRender(
        <StoreProvider value={store}>
          <NetworkGasWidget />
        </StoreProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'open network selector' }));
      fireEvent.mouseOver(screen.getByText(expectedChain.name));
      fireEvent.click(screen.getByText((mockGasPrices.rapid.maxFeePerGas / 2).toFixed(0)));
      expect(mockSetGasPrice).toHaveBeenNthCalledWith(1, mockGasPrices.rapid);
    });
  });

  // describe('in mobile mode', () => {
  //   beforeEach(addSpies);

  //   it('can select gas options', () => {
  //     const mockSetGasPrice = jest.fn();
  //     store.chain.setGasPrice = action(mockSetGasPrice);
  //     window.matchMedia = createMatchMedia(480);

  //     customRender(
  //       <StoreProvider value={store}>
  //         <NetworkGasWidget />
  //       </StoreProvider>,
  //     );

  //     fireEvent.click(screen.getByRole('button', { name: 'open network selector' }));
  //     fireEvent.click(screen.getAllByRole('button', { name: 'show gas options' })[0]);
  //     fireEvent.click(screen.getByText((mockGasPrices.rapid.maxFeePerGas / 2).toFixed(0)));
  //     expect(mockSetGasPrice).toHaveBeenNthCalledWith(1, mockGasPrices.rapid);
  //   });
  // });
});
