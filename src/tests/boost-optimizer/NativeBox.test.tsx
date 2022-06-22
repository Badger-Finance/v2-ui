import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import { NativeBox } from '../../components/Boost/NativeBox';
import store from '../../mobx/stores/RootStore';
import { customRender, screen } from '../Utils';

describe('Native Box', () => {
  it('triggers increase and decrease actions', () => {
    const spyIncrease = jest.fn();
    const spyDecrease = jest.fn();

    customRender(
      <StoreProvider value={store}>
        <NativeBox
          isLoading={false}
          currentStakeRatio={1000}
          nativeBalance={'0'}
          nonNativeBalance={'0'}
          onChange={jest.fn()}
          onIncrement={spyIncrease}
          onReduction={spyDecrease}
          onApplyNextLevelAmount={jest.fn()}
          onApplyNativeToAdd={jest.fn()}
        />
      </StoreProvider>,
    );

    const increaseButton = screen.getByRole('button', {
      name: 'increase native holdings',
    });
    const decreaseButton = screen.getByRole('button', {
      name: 'decrease native holdings',
    });

    userEvent.click(increaseButton);
    userEvent.click(decreaseButton);

    expect(spyIncrease).toHaveBeenCalled();
    expect(spyIncrease).toHaveBeenCalled();
  });

  it('does not trigger increase and decrease actions if loading', () => {
    const spyIncrease = jest.fn();
    const spyDecrease = jest.fn();

    customRender(
      <StoreProvider value={store}>
        <NativeBox
          isLoading={true}
          currentStakeRatio={1000}
          nativeBalance={'0'}
          nonNativeBalance={'0'}
          onChange={jest.fn()}
          onIncrement={spyIncrease}
          onReduction={spyDecrease}
          onApplyNextLevelAmount={jest.fn()}
          onApplyNativeToAdd={jest.fn()}
        />
      </StoreProvider>,
    );

    const increaseButton = screen.getByRole('button', {
      name: 'increase native holdings',
    });
    const decreaseButton = screen.getByRole('button', {
      name: 'decrease native holdings',
    });

    userEvent.click(increaseButton);
    userEvent.click(decreaseButton);

    expect(spyIncrease).not.toHaveBeenCalled();
    expect(spyIncrease).not.toHaveBeenCalled();
  });
});
