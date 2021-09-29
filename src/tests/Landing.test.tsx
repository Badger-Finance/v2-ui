import React from 'react';
import { customRender } from './Utils';
import Landing from '../pages/Landing';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';
import BigNumber from 'bignumber.js';
import { mockApi } from './utils/apiV2';
import { SettState } from '../mobx/model/setts/sett-state';
import { Ethereum } from 'mobx/model/network/eth.network';
import * as api from '../mobx/utils/apiV2';

describe('Landing Page', () => {
	beforeEach(() => {
		fetchMock.resetMocks();

		jest.spyOn(Ethereum.prototype, 'updateGasPrices').mockReturnValue(
			Promise.resolve({
				rapid: 153000000000 / 1e9,
				fast: 147000000000 / 1e9,
				standard: 140000000000 / 1e9,
				slow: 127000000000 / 1e9,
			}),
		);

		store.user.accountDetails = {
			id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
			value: 0,
			earnedValue: 0,
			balances: [],
			depositLimits: {
				'0x4b92d19c11435614CD49Af1b589001b7c08cD4D9': {
					available: 0.5,
					limit: 0.5,
				},
			},
			boost: 1,
			boostRank: 251,
			multipliers: {
				'0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': 1,
			},
			nativeBalance: 100,
			nonNativeBalance: 10,
			stakeRatio: 100,
		};

		store.network.network.deploy.token = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';

		jest.spyOn(store.prices, 'getPrice').mockReturnValue(new BigNumber(1e16));

		fetchMock.mockImplementation((url) => {
			console.log('this is the URL => ', url);
			return Promise.resolve(new Response(JSON.stringify(':)')));
		});

		mockApi();
	});

	test('Renders correctly', async () => {
		jest.spyOn(api, 'getTotalValueLocked').mockReturnValue(
			Promise.resolve({
				totalValue: 1027656295.4097776,
				setts: [
					{
						balance: 2580.4779797767615,
						name: 'Curve.fi renBTC/wBTC/sBTC',
						value: 135697015.0445408,
					},
					{
						balance: 4941.679422683604,
						name: 'Curve.fi crvRenWBTC',
						value: 257412081.12758893,
					},
					{
						balance: 2415.4268390200577,
						name: 'Curve.fi tBTC/sBTCCrv LP',
						value: 128162548.07840426,
					},
					{
						balance: 1992.1769700610525,
						name: 'Harvest Curve.fi crvRenWBTC',
						value: 103772498.37048022,
					},
					{
						balance: 0.07568321005973541,
						name: 'Uniswap Wrapped BTC/Badger',
						value: 20616381.803960983,
					},
					{
						balance: 5.8658897644e-8,
						name: 'Uniswap Wrapped BTC/Digg',
						value: 10628193.407480046,
					},
					{
						balance: 0.003869623825219316,
						name: 'Sushiswap Wrapped BTC/Wrapped Ether',
						value: 210323943.36817974,
					},
					{
						balance: 0.10604880118763182,
						name: 'Sushiswap Wrapped BTC/Badger',
						value: 26859374.32111849,
					},
					{
						balance: 7.6435509973e-8,
						name: 'Sushiswap Wrapped BTC/Digg',
						value: 12750374.947456503,
					},
					{
						balance: 374.597748655,
						name: 'Digg',
						value: 15164466.06105171,
					},
					{
						balance: 3627133.2708200538,
						name: 'Badger',
						value: 103663468.88003713,
					},
					{
						balance: 49.99999999,
						name: 'Yearn WBTC',
						value: 2605949.99947881,
					},
				],
			}),
		);

		customRender(
			<StoreProvider value={store}>
				<Landing
					title="Test Bitcoin Strategies"
					subtitle="Snapshots are great. Landing looks good."
					state={SettState.Open}
				/>
			</StoreProvider>,
		);
		// expect(container).toMatchSnapshot();
	});
});
