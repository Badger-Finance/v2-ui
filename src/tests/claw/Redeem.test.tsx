import React from 'react';
import '@testing-library/jest-dom';
import store from '../../mobx/store';
import {
	mockClaws,
	mockCollaterals,
	mockSponsorInformationByEmp,
	mockSyntheticDataByEmp,
	mockTokens,
} from './claw.mocks';
import { customRender, fireEvent, screen, within } from '../Utils';
import { StoreProvider } from '../../mobx/store-context';
import Redeem from '../../components/Claw/Redeem';
import * as RedeemHooks from '../../components/Claw/Redeem/redeem.hooks';

describe('Claw - Redeem', () => {
	beforeAll(() => {
		store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		store.contracts.tokens = mockTokens;
		store.claw.collaterals = mockCollaterals;
		store.claw.syntheticsDataByEMP = mockSyntheticDataByEmp;
		store.claw.sponsorInformationByEMP = mockSponsorInformationByEmp;
		store.claw.claws = mockClaws;
	});

	beforeEach(() => {
		customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);
	});

	test('matches snapshot', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('token list has synthetics information', () => {
		const tokenSelector = screen.getByRole('button', { name: 'Select Token' });
		expect(tokenSelector).toBeEnabled();
		fireEvent.mouseDown(tokenSelector);
		const tokenList = within(screen.getByRole('listbox'));
		expect(tokenList.getByText('USD/bBadger 5-29')).toBeInTheDocument();
		expect(tokenList.getByText('USD-[bwBTC/ETH SLP] 5-29')).toBeInTheDocument();
	});

	describe('when no synthetic token is selected', () => {
		test('percentage group is disabled', () => {
			expect(
				screen.getByRole('button', {
					name: '50%',
				}),
			).toBeDisabled();
		});

		test('action button is disabled and with text "Select a Token"', () => {
			expect(screen.getByRole('button', { name: 'Select a Token' })).toBeDisabled();
		});
	});

	describe('when a synthetic token is selected', () => {
		beforeEach(() => {
			fireEvent.mouseDown(screen.getByRole('button', { name: 'Select Token' }));
			fireEvent.click(within(screen.getByRole('listbox')).getByText('USD/bBadger 5-29'));
		});

		test('synthetic token balance is displayed', () => {
			expect(screen.getByText('Available USD/bBadger 5-29:')).toBeInTheDocument();
			expect(screen.getByText('44177.984375000041211331')).toBeInTheDocument();
		});

		test('action button is disabled and with text "Enter an amount"', () => {
			expect(screen.getByRole('button', { name: 'Enter an amount' })).toBeDisabled();
		});

		test('synthetic amount can be changed', () => {
			const [amountInput] = screen.getAllByRole('textbox');
			fireEvent.change(amountInput, { target: { value: '123' } });
			expect(screen.getByDisplayValue('123')).toBeInTheDocument();
		});

		test('synthetic token balance percentage can applied', () => {
			fireEvent.click(
				screen.getByRole('button', {
					name: '50%',
				}),
			);
			expect(screen.getByDisplayValue('22088.992187500020605665'));
		});
	});

	describe('when synthetic amount is inputted', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			jest.spyOn(RedeemHooks, 'useDetails').mockReturnValue([
				{ name: 'Expiration Date', text: 'May 29, 2021 18:00 UTC' },
				{ name: 'Expiration Price', text: '-' },
			]);
			fireEvent.mouseDown(screen.getByRole('button', { name: 'Select Token' }));
			fireEvent.click(within(screen.getByRole('listbox')).getByText('USD/bBadger 5-29'));
			const [amountInput] = screen.getAllByRole('textbox');
			fireEvent.change(amountInput, { target: { value: '123' } });
		});

		test('collateral balance to receive is displayed', () => {
			expect(screen.getByText('bBADGER')).toBeInTheDocument();
			expect(screen.getByDisplayValue('0.15107035573335676819')).toBeInTheDocument();
		});

		test('redeem details are displayed', () => {
			expect(screen.getByText('May 29, 2021 18:00 UTC')).toBeInTheDocument();
		});

		test('action button gets enabled', () => {
			expect(screen.getByRole('button', { name: 'REDEEM' })).toBeEnabled();
		});
	});
});
