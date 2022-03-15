import store from '../mobx/RootStore';
import PricesStore from '../mobx/stores/PricesStore';
import BigNumber from 'bignumber.js';
import VaultStore from '../mobx/stores/VaultStore';
import UserStore from '../mobx/stores/UserStore';
import { OnboardStore } from '../mobx/stores/OnboardStore';
import { checkSnapshot } from './utils/snapshots';
import { createMatchMedia } from './Utils';
import React from 'react';
import Navbar from '../components-v2/navbar';
import { RouterStore } from 'mobx-router';
import { SAMPLE_EXCHANGES_RATES } from './utils/samples';

class ResizeObserver {
	disconnect() {}

	observe() {}

	unobserve() {}
}

describe('Navbar', () => {
	beforeEach(() => {
		global.ResizeObserver = ResizeObserver;
		store.prices.exchangeRates = SAMPLE_EXCHANGES_RATES;
		store.network.network.deploy.token = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
		store.onboard.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';

		jest.spyOn(RouterStore.prototype, 'currentPath', 'get').mockReturnValue('/');
		jest.spyOn(UserStore.prototype, 'initialized', 'get').mockReturnValue(true);
		jest.spyOn(UserStore.prototype, 'portfolioValue', 'get').mockReturnValue(new BigNumber(10_00));
		jest.spyOn(OnboardStore.prototype, 'isActive').mockReturnValue(true);
		jest.spyOn(PricesStore.prototype, 'getPrice').mockReturnValue(new BigNumber(80));
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
