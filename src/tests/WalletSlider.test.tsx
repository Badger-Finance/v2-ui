import React from 'react';
import WalletSlider from '../components-v2/landing/WalletSlider';
import '@testing-library/jest-dom';
import { checkSnapshot } from './utils/snapshots';

describe('WalletSlider', () => {
  test('Renders correctly', () => {
    checkSnapshot(<WalletSlider />);
  });
  // Clicking on slider produces changes in other part of the DOM, to be tested on integration (Landing.test.tsx)
});
