import React from 'react';
import { customRender } from './Utils';
import Landing from '../pages/Landing';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';
import { checkSnapshot } from './utils/snapshots';
import BigNumber from 'bignumber.js';
import UserStore from 'mobx/stores/UserStore';
import { SettState } from '@badger-dao/sdk';

describe('Landing', () => {
	beforeEach(() => {
		store.prices.getPrice = jest.fn().mockReturnValue(new BigNumber(15e18));
		store.network.network.deploy.token = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
		store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		store.user.accountDetails = {
			address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
			value: 0,
			earnedValue: 0,
			data: {},
			boost: 1,
			boostRank: 251,
			multipliers: {
				'0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': 1,
			},
			nativeBalance: 100,
			nonNativeBalance: 10,
			stakeRatio: 100,
		};
		jest.spyOn(UserStore.prototype, 'initialized', 'get').mockReturnValue(true);
		jest.spyOn(UserStore.prototype, 'portfolioValue', 'get').mockReturnValue(new BigNumber(1000));
	});

	test('Renders correctly', async () => {
		checkSnapshot(
			<Landing
				title="Test Bitcoin Strategies"
				subtitle="Snapshots are great. Landing looks good."
				state={SettState.Open}
			/>,
		);
	});
});
