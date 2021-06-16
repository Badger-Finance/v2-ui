import React from 'react';
import { customRender } from './Utils';
import Landing from '../pages/Landing';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/store';
import { EthNetwork } from 'mobx/model';
import BigNumber from 'bignumber.js';
import { mockApi } from './utils/apiV2';

describe('Landing Page', () => {
	beforeEach(() => {
		jest.spyOn(EthNetwork.prototype, 'getGasPrices').mockReturnValue(
			Promise.resolve({
				rapid: 153000000000 / 1e9,
				fast: 147000000000 / 1e9,
				standard: 140000000000 / 1e9,
				slow: 127000000000 / 1e9,
			}),
		);
		jest.spyOn(store.prices, 'getPrice').mockReturnValue(new BigNumber(1e16));
		mockApi();
	});

	test('Renders correctly', async () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Landing experimental={false} />
			</StoreProvider>,
		);
		//await screen.findByText('All Setts');
		expect(container).toMatchSnapshot();
	});
});
