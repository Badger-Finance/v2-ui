import React from 'react';
import BigNumber from 'bignumber.js';
import '@testing-library/jest-dom';
import { customRender, fireEvent, screen, within } from '../Utils';
import { StoreProvider } from '../../mobx/store-context';
import store from '../../mobx/store';
import ClawStore from '../../mobx/stores/claw/clawStore';
import Mint from '../../components/Claws/Mint';
import * as MintHooks from '../../components/Claws/Mint/mint.hooks';
import {
	mockClawsByCollaterals,
	mockCollaterals,
	mockSyntheticData,
	mockSyntheticDataByEmp,
	mockTokens,
} from './claw.mocks';

jest.spyOn(ClawStore.prototype, 'fetchSyntheticsData');
jest.spyOn(ClawStore.prototype, 'fetchSponsorData');

const collateralAmountToUse = '100.00';
const syntheticAmountToUse = '150.00';

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
			// Select a collateral token
			beforeEach(() => {
				const collateralTokenSelector = screen.getByRole('button', { name: 'Select Token' });

				// Click the collateral options list
				fireEvent.mouseDown(collateralTokenSelector);
				const collateralsListBox = within(screen.getByRole('listbox'));
				// Select the collateral token from the list
				fireEvent.click(collateralsListBox.getByText('bBADGER'));
			});

			test('token name is displayed in the select', () => {
				const [collateralAmountInput] = screen.getAllByRole('textbox');

				// The button with the collateral token name should appear
				expect(
					screen.getByRole('button', {
						name: 'bBADGER',
					}),
				).toBeInTheDocument();

				// The amount inputs and percentage buttons should be enabled too
				expect(collateralAmountInput).toBeEnabled();
			});

			test('token balance is displayed', () => {
				expect(screen.getByText('522.378430153821121982')).toBeInTheDocument();
			});

			test('token mint amount can be changed', () => {
				const [collateralAmountInput] = screen.getAllByRole('textbox');

				// Enter value 100 in the input and check it changes correspondingly
				fireEvent.change(collateralAmountInput, { target: { value: collateralAmountToUse } });
				expect(screen.getByDisplayValue(collateralAmountToUse)).toBeInTheDocument();
			});

			test('token balance percentage can be applied', () => {
				const [fiftyPercentCollateralButton] = screen.getAllByRole('button', {
					name: '50%',
				});

				expect(fiftyPercentCollateralButton).toBeEnabled();
				fireEvent.click(fiftyPercentCollateralButton);
				expect(screen.getByDisplayValue('261.189215076910560991')).toBeInTheDocument();
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

		describe('when a collateral is not selected', () => {
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

				// Click the collateral options list
				fireEvent.mouseDown(collateralTokenSelector);
				const collateralsListBox = within(screen.getByRole('listbox'));
				// Select the collateral token from the list
				fireEvent.click(collateralsListBox.getByText('bBADGER'));
				fireEvent.change(collateralAmountInput, { target: { value: '100' } });
			});

			test('synthetic select is enabled', () => {
				expect(screen.getByRole('button', { name: 'Select CLAW' })).toBeEnabled();
			});

			describe('when a synthetic token is selected too', () => {
				beforeEach(() => {
					const syntheticSelector = screen.getByRole('button', { name: 'Select CLAW' });

					// Click the collateral options list
					fireEvent.mouseDown(syntheticSelector);
					const collateralsListBox = within(screen.getByRole('listbox'));
					// Select the synthetic from the list
					fireEvent.click(collateralsListBox.getByText('USD/bBadger 5-29'));
				});

				test('selected synthetic name is displayed', () => {
					const [, syntheticAmountInput] = screen.getAllByRole('textbox');

					// The button with the collateral token name should appear
					expect(
						screen.getByRole('button', {
							name: 'USD/bBadger 5-29',
						}),
					).toBeInTheDocument();

					// The amount inputs and percentage buttons should be enabled too
					expect(syntheticAmountInput).toBeEnabled();
				});

				test('correct max CLAW amount is displayed', () => {
					expect(screen.getByText('200')).toBeInTheDocument();
				});

				test('synthetic amount can be changed', () => {
					const [, syntheticAmountInput] = screen.getAllByRole('textbox');
					// Enter value 100 in the input and check it changes correspondingly
					fireEvent.change(syntheticAmountInput, { target: { value: syntheticAmountToUse } });
					expect(screen.getByDisplayValue(syntheticAmountToUse)).toBeInTheDocument();
				});

				test('synthetic percentage can be applied', () => {
					const [, fiftyPercentSyntheticButton] = screen.getAllByRole('button', {
						name: '50%',
					});
					expect(fiftyPercentSyntheticButton).toBeEnabled();
					fireEvent.click(fiftyPercentSyntheticButton);
					expect(screen.getByDisplayValue('100')).toBeInTheDocument();
				});

				test('on synthetic input action button gets enabled', () => {
					const [, syntheticAmountInput] = screen.getAllByRole('textbox');
					// Enter value 100 in the input and check it changes correspondingly
					fireEvent.change(syntheticAmountInput, { target: { value: syntheticAmountToUse } });
					expect(screen.getByDisplayValue(syntheticAmountToUse)).toBeInTheDocument();
					expect(screen.getByRole('button', { name: 'MINT' })).toBeEnabled();
				});
			});
		});
	});
});
