import React from 'react';
import { DelegationState } from '../mobx/model/setts/locked-cvx-delegation';
import { customRender } from './Utils';
import store from '../mobx/RootStore';
import { StoreProvider } from '../mobx/store-context';
import DelegationButton from '../components-v2/locked-cvx-bribes/DelegationButton';
import LockedCvxDelegationStore from '../mobx/stores/lockedCvxDelegationStore';

describe('LockedCvxDelegationButton', () => {
	it('handles eligible state', () => {
		jest.spyOn(LockedCvxDelegationStore.prototype, 'canUserDelegate', 'get').mockReturnValue(true);
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
		jest.spyOn(LockedCvxDelegationStore.prototype, 'canUserDelegate', 'get').mockReturnValue(false);
		const { container } = customRender(
			<StoreProvider value={store}>
				<DelegationButton />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	it('handles delegated state', () => {
		store.lockedCvxDelegation.delegationState = DelegationState.Delegated;
		jest.spyOn(LockedCvxDelegationStore.prototype, 'canUserDelegate', 'get').mockReturnValue(true);
		const { container } = customRender(
			<StoreProvider value={store}>
				<DelegationButton />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	it('handles badger delegated state', () => {
		jest.spyOn(LockedCvxDelegationStore.prototype, 'canUserDelegate', 'get').mockReturnValue(true);
		store.lockedCvxDelegation.delegationState = DelegationState.BadgerDelegated;
		const { container } = customRender(
			<StoreProvider value={store}>
				<DelegationButton />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
});
