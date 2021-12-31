import React from 'react';
import store from '../mobx/RootStore';
import { customRender, fireEvent, screen } from './Utils';
import { StoreProvider } from '../mobx/store-context';
import LockeDelegationBanner from '../../src/components-v2/locked-cvx-bribes/Banner';
import { checkSnapshot } from './utils/snapshots';
import { DelegationState } from '../mobx/model/setts/locked-cvx-delegation';
import BigNumber from 'bignumber.js';
import LockedCvxDelegationStore from '../mobx/stores/lockedCvxDelegationStore';

describe('Locked CVX Delegation Banner', () => {
  beforeEach(() => {
    store.lockedCvxDelegation.delegationState = DelegationState.Eligible;
    store.lockedCvxDelegation.totalEarned = new BigNumber(100 * 1e18);
    store.lockedCvxDelegation.lockedCVXBalance = new BigNumber(100 * 1e18);
    store.lockedCvxDelegation.unclaimedBalance = new BigNumber(100 * 1e18);

    jest.spyOn(LockedCvxDelegationStore.prototype, 'canUserDelegate', 'get').mockReturnValue(true);
    jest.spyOn(LockedCvxDelegationStore.prototype, 'shouldBannerBeDisplayed', 'get').mockReturnValue(true);
  });

  it('renders correctly', () => {
    checkSnapshot(<LockeDelegationBanner />);
  });

  it('can click delegate locked cvx', async () => {
    const mockDelegateLocked = jest.fn();
    store.lockedCvxDelegation.delegateLockedCVX = mockDelegateLocked;

    customRender(
      <StoreProvider value={store}>
        <LockeDelegationBanner />
      </StoreProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delegate to Badger' }));

    expect(mockDelegateLocked).toHaveBeenCalled();
  });
});
