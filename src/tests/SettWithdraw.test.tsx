import React from 'react';
import '@testing-library/jest-dom';
import { SAMPLE_BADGER_SETT, SAMPLE_SETT } from './utils/samples';
import { customRender } from './Utils';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';
import { SettWithdraw } from '../components-v2/common/dialogs/SettWithdraw';

describe('Sett Withdraw', () => {
	test('displays sett information', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<SettWithdraw open={true} sett={SAMPLE_SETT} badgerSett={SAMPLE_BADGER_SETT} onClose={jest.fn()} />
			</StoreProvider>,
		);
		expect(baseElement).toMatchSnapshot();
	});
});
