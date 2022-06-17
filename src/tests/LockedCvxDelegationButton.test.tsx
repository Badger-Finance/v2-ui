import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import DelegationButton from '../components-v2/locked-cvx-bribes/DelegationButton';
import { DelegationState } from '../mobx/model/vaults/locked-cvx-delegation';
import LockedCvxDelegationStore from '../mobx/stores/lockedCvxDelegationStore';
import store from '../mobx/stores/RootStore';
import { customRender } from './Utils';

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
