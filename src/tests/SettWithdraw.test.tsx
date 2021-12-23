import React from 'react';
import '@testing-library/jest-dom';
import { SAMPLE_BADGER_SETT, SAMPLE_SETT } from './utils/samples';
import { customRender } from './Utils';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';
import { VaultWithdraw } from '../components-v2/common/dialogs/VaultWithdraw';

describe('Vault Withdraw', () => {
	test('displays sett information', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<VaultWithdraw open={true} vault={SAMPLE_SETT} badgerVault={SAMPLE_BADGER_SETT} onClose={jest.fn()} />
			</StoreProvider>,
		);
		expect(baseElement).toMatchSnapshot();
	});
});
