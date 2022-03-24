import React from 'react';
import { StoreProvider } from '../mobx/store-context';
import NetworkGasWidget from '../components-v2/common/NetworkGasWidget';
import { customRender, screen, fireEvent, createMatchMedia } from './Utils';
import store from '../mobx/RootStore';
import { defaultNetwork, supportedNetworks } from '../config/networks.config';
import GasPricesStore from '../mobx/stores/GasPricesStore';
import { action } from 'mobx';

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
		jest.spyOn(GasPricesStore.prototype, 'initialized', 'get').mockReturnValue(true);
		jest.spyOn(GasPricesStore.prototype, 'getGasPrices').mockReturnValue(mockGasPrices);
	});

	it('displays network options', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<NetworkGasWidget />
			</StoreProvider>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'open network selector' }));
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

		fireEvent.click(screen.getByRole('button', { name: 'open network selector' }));
		fireEvent.click(screen.getByText(supportedNetworks[2].name));
		expect(mockSelectNetwork).toHaveBeenNthCalledWith(1, supportedNetworks[2].id);
	});

	describe('in desktop mode', () => {
		it('can select gas options', () => {
			const mockSetGasPrice = jest.fn();
			store.uiState.setGasPrice = action(mockSetGasPrice);

			customRender(
				<StoreProvider value={store}>
					<NetworkGasWidget />
				</StoreProvider>,
			);

			fireEvent.click(screen.getByRole('button', { name: 'open network selector' }));
			fireEvent.mouseOver(screen.getByText(defaultNetwork.name));
			fireEvent.click(screen.getByText((mockGasPrices.rapid.maxFeePerGas / 2).toFixed(0)));
			expect(mockSetGasPrice).toHaveBeenNthCalledWith(1, 'rapid');
		});
	});

	describe('in mobile mode', () => {
		it('can select gas options', () => {
			const mockSetGasPrice = jest.fn();
			store.uiState.setGasPrice = action(mockSetGasPrice);
			window.matchMedia = createMatchMedia(480);

			customRender(
				<StoreProvider value={store}>
					<NetworkGasWidget />
				</StoreProvider>,
			);

			fireEvent.click(screen.getByRole('button', { name: 'open network selector' }));
			fireEvent.click(screen.getByRole('button', { name: 'show gas options' }));
			fireEvent.click(screen.getByText((mockGasPrices.rapid.maxFeePerGas / 2).toFixed(0)));
			expect(mockSetGasPrice).toHaveBeenNthCalledWith(1, 'rapid');
		});
	});
});
