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
import { customRender, screen, fireEvent, within } from '../Utils';
import { StoreProvider } from '../../mobx/store-context';
import Manage from '../../components/Claws/Manage';
import * as ManageHooks from '../../components/Claws/Manage/manage.hooks';

describe('Claw - Manage', () => {
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
				<Manage />
			</StoreProvider>,
		);
	});

	test('matches snapshot', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Manage />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('mode select is displayed', () => {
		expect(screen.getByRole('button', { name: 'DEPOSIT' })).toBeInTheDocument();
	});

	test('mode can be changed', () => {
		fireEvent.mouseDown(screen.getByRole('button', { name: 'DEPOSIT' }));
		fireEvent.click(within(screen.getByRole('listbox')).getByText('WITHDRAW'));
		expect(screen.getByRole('button', { name: 'WITHDRAW' })).toBeInTheDocument();
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

		test('its collateral token balance is displayed', () => {
			expect(screen.getByText('Available bBADGER:')).toBeInTheDocument();
			expect(screen.getByText('522.378430153821121982')).toBeInTheDocument();
		});

		test('action button is disabled and with text "Enter an amount"', () => {
			expect(screen.getByRole('button', { name: 'Enter an amount' })).toBeDisabled();
		});

		test('synthetic amount can be changed', () => {
			fireEvent.change(screen.getByRole('textbox'), { target: { value: '123' } });
			expect(screen.getByDisplayValue('123')).toBeInTheDocument();
		});

		test('collateral token balance percentage can applied', () => {
			fireEvent.click(
				screen.getByRole('button', {
					name: '50%',
				}),
			);
			expect(screen.getByDisplayValue('261.189215076910560991'));
		});
	});

	describe('Deposit Mode', () => {
		describe('when synthetic amount is inputted ', () => {
			beforeEach(() => {
				jest.clearAllMocks();
				jest.spyOn(ManageHooks, 'useDetails').mockReturnValue([
					{
						name: 'Liquidation Price',
						text: '6605.341175597608242402 $',
					},
					{
						name: 'Minimum Deposit',
						text: '100 CLAW',
					},
					{
						name: 'Collateral Ratio - Global',
						text: '0.001228214274254933 bBADGER',
					},
					{
						name: 'Collateral Ratio - Minimum',
						text: '1.2 $',
					},
					{
						name: 'Collateral Ratio - Current',
						text: '53.60346523838656428672 $',
					},
					{
						name: 'Expiration',
						text: 'May 29, 2021 22:00 UTC',
					},
				]);
				fireEvent.mouseDown(screen.getByRole('button', { name: 'Select Token' }));
				fireEvent.click(within(screen.getByRole('listbox')).getByText('USD/bBadger 5-29'));
				fireEvent.change(screen.getByRole('textbox'), { target: { value: '123' } });
			});

			test('action button is enabled', () => {
				const [, actionButton] = screen.getAllByRole('button', { name: 'DEPOSIT' });
				expect(actionButton).toBeEnabled();
			});

			test('deposit details are displayed', () => {
				expect(screen.getByText('6605.341175597608242402 $')).toBeInTheDocument();
				expect(screen.getByText('100 CLAW')).toBeInTheDocument();
				expect(screen.getByText('0.001228214274254933 bBADGER')).toBeInTheDocument();
				expect(screen.getByText('1.2 $')).toBeInTheDocument();
				expect(screen.getByText('53.60346523838656428672 $')).toBeInTheDocument();
				expect(screen.getByText('May 29, 2021 22:00 UTC')).toBeInTheDocument();
			});
		});
	});

	describe('Withdraw Mode', () => {
		describe('when synthetic amount is inputted ', () => {
			beforeEach(() => {
				jest.clearAllMocks();
				jest.spyOn(ManageHooks, 'useDetails').mockReturnValue([
					{
						name: 'Withdraw Speed',
						text: 'Slow',
					},
					{
						name: 'Minimum Deposit',
						text: '100 CLAW',
					},
					{
						name: 'Collateral Ratio - Global',
						text: '2.065952e-12 bSLP',
					},
					{
						name: 'Collateral Ratio - Minimum',
						text: '1.2 $',
					},
					{
						name: 'Collateral Ratio - Current',
						text: '54723969744.51006123772 $',
					},
					{
						name: 'Expiration',
						text: 'May 29, 2021 22:00 UTC',
					},
				]);
				const [modeSelect] = screen.getAllByRole('button', { name: 'DEPOSIT' });
				fireEvent.mouseDown(modeSelect);
				fireEvent.click(within(screen.getByRole('listbox')).getByText('WITHDRAW'));
				fireEvent.mouseDown(screen.getByRole('button', { name: 'Select Token' }));
				fireEvent.click(within(screen.getByRole('listbox')).getByText('USD-[bwBTC/ETH SLP] 5-29'));
				fireEvent.change(screen.getByRole('textbox'), { target: { value: '123' } });
			});

			test('action button is enabled', () => {
				const [, actionButton] = screen.getAllByRole('button', { name: 'WITHDRAW' });
				expect(actionButton).toBeEnabled();
			});

			test('deposit details are displayed', () => {
				expect(screen.getByText('Slow')).toBeInTheDocument();
				expect(screen.getByText('100 CLAW')).toBeInTheDocument();
				expect(screen.getByText('2.065952e-12 bSLP')).toBeInTheDocument();
				expect(screen.getByText('1.2 $')).toBeInTheDocument();
				expect(screen.getByText('54723969744.51006123772 $')).toBeInTheDocument();
				expect(screen.getByText('May 29, 2021 22:00 UTC')).toBeInTheDocument();
			});
		});
	});
});
