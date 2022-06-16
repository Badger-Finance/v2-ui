import copy from 'copy-to-clipboard';
import React from 'react';

import InvalidCycleDialog from '../components-v2/common/dialogs/InvalidCycleDialog';
import store from '../mobx/RootStore';
import { StoreProvider } from '../mobx/store-context';
import { customRender, fireEvent, screen } from './Utils';

jest.mock('copy-to-clipboard');

describe('InvalidCycleDialog', () => {
	beforeEach(() => {
		store.rewards.badgerTree = {
			cycle: '123',
			lastCycle: new Date(),
			timeSinceLastCycle: '0h 0m',
			proof: undefined,
			claimableAmounts: [],
			claims: [],
			amounts: [],
		};
	});

	it('displays invalid cycle dialog', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<InvalidCycleDialog open={true} onClose={jest.fn()} />
			</StoreProvider>,
		);
		expect(baseElement).toMatchSnapshot();
	});

	it('can copy cycle to clipboard', () => {
		customRender(
			<StoreProvider value={store}>
				<InvalidCycleDialog open={true} onClose={jest.fn()} />
			</StoreProvider>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'copy to clipboard' }));
		expect(copy).toHaveBeenCalledWith('123');
	});
});
