import React from 'react';
import '@testing-library/jest-dom';
import { VaultDeposit } from '../components-v2/common/dialogs/VaultDeposit';
import { SAMPLE_BADGER_SETT, SAMPLE_SETT } from './utils/samples';
import { customRender, screen } from './Utils';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';
import userEvent from '@testing-library/user-event';
import VaultStore from '../mobx/stores/VaultStore';

describe('Vault Deposit', () => {
	beforeEach(() => {
		jest.spyOn(VaultStore.prototype, 'getVaultDefinition').mockReturnValue({
			depositToken: { address: SAMPLE_SETT.underlyingToken, decimals: 18 },
			vaultToken: { address: SAMPLE_SETT.vaultToken, decimals: 18 },
		});
	});

	test('displays sett information', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<VaultDeposit open={true} vault={SAMPLE_SETT} badgerVault={SAMPLE_BADGER_SETT} onClose={jest.fn()} />
			</StoreProvider>,
		);
		expect(baseElement).toMatchSnapshot();
	});

	test('can see full fees descriptions', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<VaultDeposit open={true} vault={SAMPLE_SETT} badgerVault={SAMPLE_BADGER_SETT} onClose={jest.fn()} />
			</StoreProvider>,
		);
		userEvent.click(screen.getByTitle('Click to see full description'));
		expect(baseElement).toMatchSnapshot();
	});

	test('can go back from full fees descriptions', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<VaultDeposit open={true} vault={SAMPLE_SETT} badgerVault={SAMPLE_BADGER_SETT} onClose={jest.fn()} />
			</StoreProvider>,
		);
		userEvent.click(screen.getByTitle('Click to see full description'));
		userEvent.click(screen.getByRole('button', { name: 'Back' }));
		expect(baseElement).toMatchSnapshot();
	});
});
