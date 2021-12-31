import React from 'react';
import '@testing-library/jest-dom';
import DroptModalItem from 'components/Digg/DroptModalItem';
import BigNumber from 'bignumber.js';
import { customRender } from 'tests/Utils';

describe('Dropt Modal Item', () => {
  it('renders correctly', () => {
    const { container } = customRender(
      <DroptModalItem
        key="DROPT-2"
        token="DROPT-2"
        balance={new BigNumber(1)}
        displayBalance={'0.001'}
        redemptionAmount={'0.001'}
        redemptionContract={'0x111111111111111111111111'}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
