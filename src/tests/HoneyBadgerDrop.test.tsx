import React from 'react';
import { act, cleanup, customRender } from './Utils';
import HoneybadgerDrop from './../components/HoneybadgerDrop/index';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';
import { action } from 'mobx';
import { checkSnapshot } from './utils/snapshots';
import { WalletStore } from '../mobx/stores/WalletStore';

describe('HoneybadgerDrop Page', () => {
	const connectedStore = store;

	beforeEach(() => {
		connectedStore.honeyPot.fetchNFTS = action(jest.fn());
		connectedStore.honeyPot.fetchPoolBalance = action(jest.fn());
	});

	afterEach(cleanup);

	test('Renders correctly without connected address', () => checkSnapshot(<HoneybadgerDrop />));

	test('Renders correctly with connected address', () => {
		act(() => {
			jest.spyOn(WalletStore.prototype, 'isConnected', 'get').mockReturnValue(true);
			jest.spyOn(WalletStore.prototype, 'address', 'get').mockReturnValue(
				'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
			);
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
			jest.spyOn(WalletStore.prototype, 'isConnected', 'get').mockReturnValue(true);
			jest.spyOn(WalletStore.prototype, 'address', 'get').mockReturnValue(
				'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
			);
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
