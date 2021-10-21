import React from 'react';
import { DelegationState } from '../mobx/model/setts/locked-cvx-delegation';
import { customRender } from './Utils';
import store from '../mobx/RootStore';
import { StoreProvider } from '../mobx/store-context';
import { Ethereum } from '../mobx/model/network/eth.network';
import DelegationButton from '../components-v2/locked-cvx-bribes/DelegationButton';

describe('LockedCvxDelegationButton', () => {
	beforeAll(() => {
		store.network.network = new Ethereum();
	});

	it('handles eligible state', () => {
		store.lockedCvxDelegation.delegationState = DelegationState.Eligible;
		const { container } = customRender(
			<StoreProvider value={store}>
				<DelegationButton />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	it('handles ineligible state', () => {
		store.lockedCvxDelegation.delegationState = DelegationState.Ineligible;
		const { container } = customRender(
			<StoreProvider value={store}>
				<DelegationButton />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	it('handles delegated state', () => {
		store.lockedCvxDelegation.delegationState = DelegationState.Delegated;
		const { container } = customRender(
			<StoreProvider value={store}>
				<DelegationButton />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	it('handles badger delegated state', () => {
		store.lockedCvxDelegation.delegationState = DelegationState.BadgerDelegated;
		const { container } = customRender(
			<StoreProvider value={store}>
				<DelegationButton />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
});
