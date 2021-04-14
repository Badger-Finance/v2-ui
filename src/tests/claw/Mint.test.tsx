import React from 'react';
import BigNumber from 'bignumber.js';
import '@testing-library/jest-dom';
import { customRender, fireEvent, screen, within } from '../Utils';
import { StoreProvider } from '../../mobx/store-context';
import store from '../../mobx/store';
import ClawStore from '../../mobx/stores/claw/clawStore';
import Mint from '../../components/Claw/Mint';
import * as MintHooks from '../../components/Claw/Mint/mint.hooks';
import {
	mockClawsByCollaterals,
	mockCollaterals,
	mockSyntheticData,
	mockSyntheticDataByEmp,
	mockTokens,
} from './claw.mocks';

jest.spyOn(ClawStore.prototype, 'fetchSyntheticsData');
jest.spyOn(ClawStore.prototype, 'fetchSponsorData');

describe('Claw - Mint', () => {
	beforeAll(() => {
		store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		store.contracts.tokens = mockTokens;
		store.claw.collaterals = mockCollaterals;
		store.claw.syntheticsData = mockSyntheticData;
		store.claw.syntheticsDataByEMP = mockSyntheticDataByEmp;
		store.claw.clawsByCollateral = mockClawsByCollaterals;
	});

	test('matches snapshot', () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Mint />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	describe('Collateral Token', () => {
		beforeEach(() =>
			customRender(
				<StoreProvider value={store}>
					<Mint />
				</StoreProvider>,
			),
		);

		describe('when a collateral token is not selected', () => {
			test('input amount is disabled', () => {
				const [collateralAmount] = screen.getAllByRole('textbox');
				expect(collateralAmount).toBeDisabled();
			});

			test('percentage buttons are disabled', () => {
				const [fiftyPercentCollateralButton] = screen.getAllByRole('button', {
					name: '50%',
				});
				expect(fiftyPercentCollateralButton).toBeDisabled();
			});

			test('action button is disabled and with "Select a Collateral Token" as text', () => {
				expect(screen.getByRole('button', { name: 'Select a Collateral Token' })).toBeDisabled();
			});
		});

		describe('when a collateral token is selected', () => {
			beforeEach(() => {
				const collateralTokenSelector = screen.getByRole('button', { name: 'Select Token' });
				fireEvent.mouseDown(collateralTokenSelector);
				const collateralsListBox = within(screen.getByRole('listbox'));
				fireEvent.click(collateralsListBox.getByText('bBADGER'));
			});

			test('token name is displayed in the select', () => {
				const [collateralAmountInput] = screen.getAllByRole('textbox');
				expect(
					screen.getByRole('button', {
						name: 'bBADGER',
					}),
				).toBeInTheDocument();
				expect(collateralAmountInput).toBeEnabled();
			});

			test('token balance is displayed', () => {
				expect(screen.getByText('522.378430153821121982')).toBeInTheDocument();
			});

			test('token mint amount can be changed', () => {
				const [collateralAmountInput] = screen.getAllByRole('textbox');
				fireEvent.change(collateralAmountInput, { target: { value: '100.00' } });
				expect(screen.getByDisplayValue('100.00')).toBeInTheDocument();
			});

			test('token balance percentage can be applied', () => {
				const [fiftyPercentCollateralButton] = screen.getAllByRole('button', {
					name: '50%',
				});

				expect(fiftyPercentCollateralButton).toBeEnabled();
				fireEvent.click(fiftyPercentCollateralButton);
				expect(screen.getByDisplayValue('261.189215076910560991')).toBeInTheDocument();
			});

			test('action button is disabled on amounts bigger that collateral token balance', () => {
				const [collateralAmountInput] = screen.getAllByRole('textbox');
				fireEvent.change(collateralAmountInput, { target: { value: '1044.00' } });
				expect(screen.getByDisplayValue('1044.00')).toBeInTheDocument();
				expect(screen.getByRole('button', { name: 'Insufficient bBADGER balance' })).toBeDisabled();
			});

			test('action button is disabled and with "Enter collateral amount" as text', () => {
				expect(screen.getByRole('button', { name: 'Enter collateral amount' })).toBeDisabled();
			});
		});
	});

	describe('Synthetic Token', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			jest.spyOn(MintHooks, 'useMaxClaw').mockReturnValue(new BigNumber('200000000000000000000'));
			customRender(
				<StoreProvider value={store}>
					<Mint />
				</StoreProvider>,
			);
		});

		describe('when a collateral token is not selected', () => {
			test('amount input is disabled', () => {
				expect(screen.getByRole('button', { name: 'Select CLAW' })).toHaveAttribute('aria-disabled');
			});
			test('percentage buttons are disabled', () => {
				const [, fiftyPercentSyntheticButton] = screen.getAllByRole('button', {
					name: '50%',
				});
				expect(fiftyPercentSyntheticButton).toBeDisabled();
			});
		});

		describe('when a collateral token is selected', () => {
			beforeEach(() => {
				const collateralTokenSelector = screen.getByRole('button', { name: 'Select Token' });
				const [collateralAmountInput] = screen.getAllByRole('textbox');
				fireEvent.mouseDown(collateralTokenSelector);
				const collateralsListBox = within(screen.getByRole('listbox'));
				fireEvent.click(collateralsListBox.getByText('bBADGER'));
				fireEvent.change(collateralAmountInput, { target: { value: '100' } });
			});

			test('synthetic token select is enabled', () => {
				expect(screen.getByRole('button', { name: 'Select CLAW' })).toBeEnabled();
			});

			describe('when a synthetic token is selected too', () => {
				beforeEach(() => {
					const syntheticSelector = screen.getByRole('button', { name: 'Select CLAW' });
					fireEvent.mouseDown(syntheticSelector);
					const collateralsListBox = within(screen.getByRole('listbox'));
					fireEvent.click(collateralsListBox.getByText('USD/bBadger 5-29'));
				});

				test('selected synthetic name is displayed', () => {
					const [, syntheticAmountInput] = screen.getAllByRole('textbox');
					expect(
						screen.getByRole('button', {
							name: 'USD/bBadger 5-29',
						}),
					).toBeInTheDocument();
					expect(syntheticAmountInput).toBeEnabled();
				});

				test('correct max CLAW amount is displayed', () => {
					expect(screen.getByText('200')).toBeInTheDocument();
				});

				test('synthetic amount can be changed', () => {
					const [, syntheticAmountInput] = screen.getAllByRole('textbox');
					fireEvent.change(syntheticAmountInput, { target: { value: '150.00' } });
					expect(screen.getByDisplayValue('150.00')).toBeInTheDocument();
				});

				test('synthetic percentage can be applied', () => {
					const [, fiftyPercentSyntheticButton] = screen.getAllByRole('button', {
						name: '50%',
					});
					expect(fiftyPercentSyntheticButton).toBeEnabled();
					fireEvent.click(fiftyPercentSyntheticButton);
					expect(screen.getByDisplayValue('100')).toBeInTheDocument();
				});

				test('action button is disabled on amounts less than the minimum mint amount', () => {
					const [, syntheticAmountInput] = screen.getAllByRole('textbox');
					fireEvent.change(syntheticAmountInput, { target: { value: '10.00' } });
					expect(screen.getByDisplayValue('10.00')).toBeInTheDocument();
					expect(screen.getByRole('button', { name: 'Insufficient input CLAW amount' })).toBeDisabled();
				});

				test('action button is enabled', () => {
					const [, syntheticAmountInput] = screen.getAllByRole('textbox');
					fireEvent.change(syntheticAmountInput, { target: { value: '150.00' } });
					expect(screen.getByDisplayValue('150.00')).toBeInTheDocument();
					expect(screen.getByRole('button', { name: 'MINT' })).toBeEnabled();
				});
			});
		});
	});
});
