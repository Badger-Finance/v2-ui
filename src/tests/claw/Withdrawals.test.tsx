import React from 'react';
import '@testing-library/jest-dom';
import store from '../../mobx/store';
import { customRender, screen } from '../Utils';
import { mockSponsorInformationByEmp, mockSyntheticData, mockSyntheticDataByEmp, mockTokens } from './claw.mocks';
import { StoreProvider } from '../../mobx/store-context';
import Withdrawals from '../../components/Claw/Withdrawals';

it('displays withdrawals elements', () => {
	store.contracts.tokens = mockTokens;
	store.claw.syntheticsDataByEMP = mockSyntheticDataByEmp;
	store.claw.sponsorInformationByEMP = mockSponsorInformationByEmp;
	store.claw.syntheticsData = mockSyntheticData;

	customRender(
		<StoreProvider value={store}>
			<Withdrawals />
		</StoreProvider>,
	);

	expect(screen.getByText('USD/bBadger 5-29')).toBeInTheDocument();
	expect(screen.getByText('54.260031017186448728')).toBeInTheDocument();
	expect(screen.getByText('Apr 05, 2021 @ 19:53 UTC')).toBeInTheDocument();

	expect(screen.getByText('USD-[bwBTC/ETH SLP] 5-29')).toBeInTheDocument();
	expect(screen.getByText('1.55307943417e-7')).toBeInTheDocument();
	expect(screen.getByText('Dec 31, 1969 @ 20:00 UTC')).toBeInTheDocument();
});
