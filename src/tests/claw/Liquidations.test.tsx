import React from 'react';
import '@testing-library/jest-dom';
import store from '../../mobx/store';
import { customRender, screen, fireEvent } from '../Utils';
import { mockSponsorInformationByEmp, mockSyntheticData, mockSyntheticDataByEmp, mockTokens } from './claw.mocks';
import { StoreProvider } from '../../mobx/store-context';
import Liquidations from '../../components/Claw/Liquidations';
import { within } from '@testing-library/react';

it('displays liquidations elements', () => {
	store.contracts.tokens = mockTokens;
	store.claw.syntheticsDataByEMP = mockSyntheticDataByEmp;
	store.claw.sponsorInformationByEMP = mockSponsorInformationByEmp;
	store.claw.syntheticsData = mockSyntheticData;

	customRender(
		<StoreProvider value={store}>
			<Liquidations />
		</StoreProvider>,
	);

	expect(screen.getByText('USD/bBadger 5-29')).toBeInTheDocument();
	expect(screen.getByText('576.576576576576576576')).toBeInTheDocument();
	expect(screen.getByText('467.467467467467467467')).toBeInTheDocument();
	expect(screen.getByText('/395.395395395395395395')).toBeInTheDocument();
	expect(screen.getByText('Apr 10, 2021')).toBeInTheDocument();

	expect(screen.getByText('USD-[bwBTC/ETH SLP] 5-29')).toBeInTheDocument();
	expect(screen.getByText('254.254254254254254254')).toBeInTheDocument();
	expect(screen.getByText('264.264264264264264264')).toBeInTheDocument();
	expect(screen.getByText('/613.613613613613613613')).toBeInTheDocument();
	expect(screen.getByText('Feb 06, 2021')).toBeInTheDocument();
	expect(screen.getByText('Complete - Feb 06, 2021')).toBeInTheDocument();
});

it('displays liquidation details on click', () => {
	store.contracts.tokens = mockTokens;
	store.claw.syntheticsDataByEMP = mockSyntheticDataByEmp;
	store.claw.sponsorInformationByEMP = mockSponsorInformationByEmp;
	store.claw.syntheticsData = mockSyntheticData;

	customRender(
		<StoreProvider value={store}>
			<Liquidations />
		</StoreProvider>,
	);

	fireEvent.click(screen.getByText('USD/bBadger 5-29'));
	expect(screen.getByRole('dialog')).toBeInTheDocument();

	const dialogContent = within(screen.getByRole('dialog'));
	expect(dialogContent.getByText('USD/bBadger 5-29 Transaction')).toBeInTheDocument();
	expect(dialogContent.getByText('773.773773773773773773')).toBeInTheDocument();
	expect(dialogContent.getByText('576.576576576576576576')).toBeInTheDocument();
	expect(dialogContent.getByText('467.467467467467467467')).toBeInTheDocument();
	expect(dialogContent.getByText('395.395395395395395395')).toBeInTheDocument();
	expect(dialogContent.getByText('33')).toBeInTheDocument();
});
