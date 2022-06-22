import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import { NonNativeBox } from '../../components/Boost/NonNativeBox';
import store from '../../mobx/stores/RootStore';
import { customRender, screen } from '../Utils';

describe('Non Native Box', () => {
  it('triggers increase and decrease actions', () => {
    const spyIncrease = jest.fn();
    const spyDecrease = jest.fn();

    customRender(
      <StoreProvider value={store}>
        <NonNativeBox
          isLoading={false}
          nonNativeBalance={'0'}
          onChange={jest.fn()}
          onIncrement={spyIncrease}
          onReduction={spyDecrease}
          onBounceAnimationEnd={jest.fn()}
          showMessageBounce={true}
        />
      </StoreProvider>,
    );

    const increaseButton = screen.getByRole('button', {
      name: 'increase non native holdings',
    });
    const decreaseButton = screen.getByRole('button', {
      name: 'decrease non native holdings',
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
        <NonNativeBox
          isLoading={true}
          nonNativeBalance={'0'}
          onChange={jest.fn()}
          onIncrement={spyIncrease}
          onReduction={spyDecrease}
          onBounceAnimationEnd={jest.fn()}
          showMessageBounce={true}
        />
      </StoreProvider>,
    );

    const increaseButton = screen.getByRole('button', {
      name: 'increase non native holdings',
    });
    const decreaseButton = screen.getByRole('button', {
      name: 'decrease non native holdings',
    });

    userEvent.click(increaseButton);
    userEvent.click(decreaseButton);

    expect(spyIncrease).not.toHaveBeenCalled();
    expect(spyIncrease).not.toHaveBeenCalled();
  });
});
