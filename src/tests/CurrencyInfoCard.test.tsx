import React from 'react';
import CurrencyInfoCard from '../components-v2/common/CurrencyInfoCard';
import '@testing-library/jest-dom';
import { checkSnapshot } from './utils/snapshots';
import { BigNumber } from '@ethersproject/providers/node_modules/@ethersproject/bignumber';

describe('CurrencyInfoCard', () => {
	test('Renders correctly', () => checkSnapshot(<CurrencyInfoCard title="Test Price" value={BigNumber.from(1)} />));
});
