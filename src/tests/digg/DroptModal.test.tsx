import React from 'react';
import '@testing-library/jest-dom';
import DroptModal from 'components/Digg/DroptModal';
import store from 'mobx/RootStore';
import SettStore from 'mobx/stores/SettStore';
import UserStore from 'mobx/stores/UserStore';
import { digg_system } from 'config/deployments/mainnet.json';
import { checkSnapshot } from 'tests/utils/snapshots';
import { customRender, fireEvent } from 'tests/Utils';
import { StoreProvider } from 'mobx/store-context';
import { mockToken } from 'mobx/model/tokens/badger-token';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { act } from 'react-dom/test-utils';
import { BigNumber } from 'ethers';

const validStore = (store.rebase.rebase = {
	totalSupply: BigNumber.from(1),
	latestRebase: 1,
	minRebaseInterval: 1,
	latestAnswer: 1,
	inRebaseWindow: true,
	rebaseLag: 1,
	epoch: 1,
	rebaseWindowLengthSec: 1,
	oracleRate: BigNumber.from(1),
	nextRebase: new Date(),
	pastRebase: 1,
	validDropts: [
		{
			[digg_system.DROPT['DROPT-2'].redemption]: {
				currentTimestamp: '1627682400',
				expirationTimestamp: '1627682200',
				expiryPrice: '1',
			},
		},
	],
});

const invalidStore = (store.rebase.rebase = {
	totalSupply: BigNumber.from(1),
	latestRebase: 1,
	minRebaseInterval: 1,
	latestAnswer: 1,
	inRebaseWindow: true,
	rebaseLag: 1,
	epoch: 1,
	rebaseWindowLengthSec: 1,
	oracleRate: BigNumber.from(1),
	nextRebase: new Date(),
	pastRebase: 1,
	validDropts: [],
});

describe('Invalid Dropt Modal', () => {
	it('is disabled when no valid dropt redemption', () => {
		store.rebase.rebase = invalidStore;
		checkSnapshot(
			<StoreProvider value={store}>
				<DroptModal />
			</StoreProvider>,
		);
	});
});

describe('Dropt Modal', () => {
	beforeEach(() => {
		store.rebase.rebase = validStore;

		jest.spyOn(SettStore.prototype, 'getToken').mockReturnValue({
			address: '0x952F4Ac36EF204a28800AA1c1586C5261B600894',
			decimals: 18,
			name: 'DIGG Rebase Option 2',
			symbol: 'DROPT-2',
		});
		jest.spyOn(UserStore.prototype, 'getTokenBalance').mockReturnValue(
			new TokenBalance(
				mockToken('0x952F4Ac36EF204a28800AA1c1586C5261B600894'),
				BigNumber.from(1),
				BigNumber.from(1),
			),
		);
	});

	it('is enabled when there is 1 valid dropt redemption', () => {
		checkSnapshot(
			<StoreProvider value={store}>
				<DroptModal />
			</StoreProvider>,
		);
	});

	test('Opens dropt modal upon click', async () => {
		const modal = customRender(
			<StoreProvider value={store}>
				<DroptModal />
			</StoreProvider>,
		);
		act(() => {
			fireEvent.click(modal.getByRole('button'));
		});

		expect(modal.getByRole('presentation')).toBeTruthy();
	});
});
