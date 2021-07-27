import React from 'react';
import '@testing-library/jest-dom';
import store from 'mobx/RootStore';
import userEvent from '@testing-library/user-event';

import { StoreProvider } from '../../mobx/store-context';
import { customRender, screen } from '../Utils';
import { Optimizer } from '../../components/Boost/Optimizer';
import * as rankUtils from '../../utils/boost-ranks';

describe('Boost Optimizer', () => {
	beforeEach(() => {
		store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		store.user.accountDetails = {
			id: '0xC26202cd0428276cC69017Df01137161f0102e55',
			boost: 1.43,
			boostRank: 123,
			multipliers: {
				'0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': 0.6181384749194523,
				'0xd04c48A53c111300aD41190D63681ed3dAd998eC': 0.5523543018519733,
				'0xb9D076fDe463dbc9f915E5392F807315Bf940334': 0.5341201002772149,
				'0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87': 0.6045632751200407,
				'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': 0.5165013357377896,
				'0x4b92d19c11435614CD49Af1b589001b7c08cD4D5': 0.6028052092763515,
				'0x8a8FFec8f4A0C8c9585Da95D9D97e8Cd6de273DE': 0.4548797589205743,
				'0x8c76970747afd5398e958bDfadA4cf0B9FcA16c4': 0.41316829888029033,
				'0x55912D0Cf83B75c492E761932ABc4DB4a5CB1b17': 0.4212673127531778,
				'0xf349c0faA80fC1870306Ac093f75934078e28991': 0.41377994228689197,
				'0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9': 0.3682893510950006,
				'0xBE08Ef12e4a553666291E9fFC24fCCFd354F2Dd2': 0.419679575056266,
				'0x53C8E199eb2Cb7c01543C137078a038937a68E40': 0.42187808912743524,
			},
			value: 0,
			earnedValue: 0,
			balances: [],
			depositLimits: {},
			nativeBalance: 1000,
			nonNativeBalance: 500,
		};

		jest.spyOn(rankUtils, 'calculateMultiplier').mockReturnValue(10);
		jest.spyOn(rankUtils, 'calculateNativeToMatchBoost').mockReturnValue(100);
	});

	it('displays correct information', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		expect(container).toMatchSnapshot();
	});

	it('can change boost', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		const boostInput = screen.getByRole('textbox', { name: 'boost multiplier number' });

		userEvent.clear(boostInput);
		userEvent.type(boostInput, '2.98');

		expect(container).toMatchSnapshot();
	});

	it('can change native and non native balances', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		const nativeInput = screen.getByRole('textbox', { name: 'native holdings amount' });
		const nonNativeInput = screen.getByRole('textbox', { name: 'non native holdings amount' });

		userEvent.clear(nativeInput);
		userEvent.clear(nonNativeInput);

		userEvent.type(nativeInput, '2000');
		userEvent.type(nonNativeInput, '1000');

		expect(container).toMatchSnapshot();
	});

	it('can increase balances through the increase button', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		const increaseNativeButton = screen.getByRole('button', { name: 'increase native holdings' });
		const increaseNonNativeButton = screen.getByRole('button', { name: 'increase non native holdings' });

		userEvent.click(increaseNativeButton);
		userEvent.click(increaseNonNativeButton);

		expect(container).toMatchSnapshot();
	});

	it('can decrease balances through the increase button', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		const decreaseNativeButton = screen.getByRole('button', { name: 'decrease native holdings' });
		const decreaseNonNativeButton = screen.getByRole('button', { name: 'decrease non native holdings' });

		userEvent.click(decreaseNativeButton);
		userEvent.click(decreaseNonNativeButton);

		expect(container).toMatchSnapshot();
	});

	it('can jump to rank', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		const rankToJump = screen.getByRole('button', { name: 'Hyper Badger Rank' });

		userEvent.click(rankToJump);

		expect(container).toMatchSnapshot();
	});

	it('shows empty non native message', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		const nonNativeInput = screen.getByRole('textbox', { name: 'non native holdings amount' });

		userEvent.clear(nonNativeInput);

		expect(container).toMatchSnapshot();
	});
});
