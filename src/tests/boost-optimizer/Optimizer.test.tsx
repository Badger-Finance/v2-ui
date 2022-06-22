import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import store from 'mobx/stores/RootStore';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import { Optimizer } from '../../components/Boost/Optimizer';
import { WalletStore } from '../../mobx/stores/WalletStore';
import * as rankUtils from '../../utils/boost-ranks';
import { customRender, screen } from '../Utils';

describe('Boost Optimizer', () => {
	beforeEach(() => {
		jest.spyOn(WalletStore.prototype, 'isConnected', 'get').mockReturnValue(true);
		jest.spyOn(WalletStore.prototype, 'address', 'get').mockReturnValue(
			'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
		);
		store.user.accountDetails = {
			address: '0xC26202cd0428276cC69017Df01137161f0102e55',
			boost: 1,
			boostRank: 123,
			value: 0,
			earnedValue: 0,
			data: {},
			claimableBalances: {},
			nativeBalance: 1000,
			nonNativeBalance: 500,
			stakeRatio: 20,
			bveCvxBalance: 100,
			nftBalance: 50,
			diggBalance: 10,
		};

		jest.spyOn(rankUtils, 'calculateUserBoost').mockReturnValue(1);
		jest.spyOn(rankUtils, 'calculateNativeToMatchRank').mockReturnValue(100);
	});

	it('displays correct information', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		expect(container).toMatchSnapshot();
	});

	it('can change native and non native balances', () => {
		customRender(
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

		expect(screen.getByRole('textbox', { name: 'native holdings amount' })).toHaveValue('$2,000');
		expect(screen.getByRole('textbox', { name: 'non native holdings amount' })).toHaveValue('$1,000');
	});

	it('can increase balances through the increase button', () => {
		customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		const increaseNativeButton = screen.getByRole('button', { name: 'increase native holdings' });
		const increaseNonNativeButton = screen.getByRole('button', { name: 'increase non native holdings' });

		userEvent.click(increaseNativeButton);
		userEvent.click(increaseNonNativeButton);

		expect(screen.getByRole('textbox', { name: 'native holdings amount' })).toHaveValue('$2,000');
		expect(screen.getByRole('textbox', { name: 'non native holdings amount' })).toHaveValue('$1,500');
	});

	it('can decrease balances through the increase button', () => {
		customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		const decreaseNativeButton = screen.getByRole('button', { name: 'decrease native holdings' });
		const decreaseNonNativeButton = screen.getByRole('button', { name: 'decrease non native holdings' });

		userEvent.click(decreaseNativeButton);
		userEvent.click(decreaseNonNativeButton);

		expect(screen.getByRole('textbox', { name: 'native holdings amount' })).toHaveValue('$0');
		expect(screen.getByRole('textbox', { name: 'non native holdings amount' })).toHaveValue('$0');
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
		jest.spyOn(rankUtils, 'calculateNativeToMatchRank').mockReturnValue(0);

		customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		const nonNativeInput = screen.getByRole('textbox', { name: 'non native holdings amount' });

		userEvent.clear(nonNativeInput);

		expect(
			screen.getByText('While reducing Non-Native may increase your boost, your gross yield will be smaller'),
		).toBeInTheDocument();
	});

	it('supports no wallet mode', () => {
		store.wallet.address = undefined;
		store.user.accountDetails = null;
		jest.spyOn(rankUtils, 'calculateNativeToMatchRank').mockReturnValue(0);

		const { container } = customRender(
			<StoreProvider value={store}>
				<Optimizer />
			</StoreProvider>,
		);

		expect(container).toMatchSnapshot();
	});
});
