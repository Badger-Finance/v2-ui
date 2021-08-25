import React from 'react';
import '@testing-library/jest-dom';
import { SettDeposit } from '../components-v2/common/dialogs/SettDeposit';
import { SAMPLE_BADGER_SETT, SAMPLE_SETT } from './utils/samples';
import { customRender, screen } from './Utils';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';
import userEvent from '@testing-library/user-event';

describe('Sett Deposit', () => {
	test('displays sett information', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<SettDeposit open={true} sett={SAMPLE_SETT} badgerSett={SAMPLE_BADGER_SETT} onClose={jest.fn()} />
			</StoreProvider>,
		);
		expect(baseElement).toMatchSnapshot();
	});

	test('can see full fees descriptions ', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<SettDeposit open={true} sett={SAMPLE_SETT} badgerSett={SAMPLE_BADGER_SETT} onClose={jest.fn()} />
			</StoreProvider>,
		);

		userEvent.click(screen.getByTitle('Click to see full description'));
		expect(baseElement).toMatchSnapshot();
	});

	test('can go back from full fees descriptions ', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<SettDeposit open={true} sett={SAMPLE_SETT} badgerSett={SAMPLE_BADGER_SETT} onClose={jest.fn()} />
			</StoreProvider>,
		);

		userEvent.click(screen.getByTitle('Click to see full description'));
		userEvent.click(screen.getByRole('button', { name: 'Back' }));
		expect(baseElement).toMatchSnapshot();
	});
});
