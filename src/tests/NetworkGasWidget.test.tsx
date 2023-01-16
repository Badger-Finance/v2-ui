import '@testing-library/jest-dom';

import { BadgerAPI } from '@badger-dao/sdk';
import NetworkGasWidget from 'components-v2/common/NetworkGasWidget';
import { supportedNetworks } from 'config/networks.config';
import store from 'mobx/stores/RootStore';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';
import { getNetworkIconPath } from 'utils/network-icon';

import GasPricesStore from '../mobx/stores/GasPricesStore';
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
  beforeEach(addSpies);

  it('should render without crashing', () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <NetworkGasWidget />
      </StoreProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'open network selector' }));
    fireEvent.mouseOver(screen.getByText(supportedNetworks[0].name));
    expect(baseElement).toMatchSnapshot();
  });

  it('should select a network', async () => {
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
});
