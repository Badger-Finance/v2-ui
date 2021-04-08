import React from 'react';
import { customRender, cleanup, act } from './Utils';
import HoneybadgerDrop from './../components/HoneybadgerDrop/index';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/store';

afterEach(cleanup);

describe('HoneybadgerDrop Page', () => {
	const connectedStore = store;

	test('Renders correctly without connected address', () => {
		const { container } = customRender(
			<StoreProvider value={connectedStore}>
				<HoneybadgerDrop />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('Renders correctly with connected address', () => {
		act(() => {
			connectedStore.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		});
		const { container } = customRender(
			<StoreProvider value={connectedStore}>
				<HoneybadgerDrop />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('Renders correctly with connected address and a balance of NFTs', () => {
		act(() => {
			connectedStore.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
			connectedStore.honeyPot.nfts = [
				{
					tokenId: '1',
					balance: '50',
					poolBalance: '0',
					totalSupply: '50',
					root: '15000',
					name: 'test',
					image: 'test.com',
				},
			];
		});
		const { container } = customRender(
			<StoreProvider value={connectedStore}>
				<HoneybadgerDrop />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
});
