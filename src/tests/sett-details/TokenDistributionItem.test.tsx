import React from 'react';
import { SAMPLE_SETT_BALANCE } from '../utils/samples';
import { TokenDistributionIcon } from '../../components-v2/vault-detail/holdings/TokenDistributionIcon';
import { customRender, screen } from '../Utils';
import userEvent from '@testing-library/user-event';
import { StoreProvider } from '../../mobx/store-context';
import store from '../../mobx/RootStore';

describe('Token Distribution Icon', () => {
	it('displays sett token distribution information on hover', async () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>{<TokenDistributionIcon settBalance={SAMPLE_SETT_BALANCE} />}</StoreProvider>,
		);
		userEvent.hover(screen.getByLabelText('sett token distribution'));
		await screen.findByText(SAMPLE_SETT_BALANCE.tokens[0].symbol);
		expect(baseElement).toMatchSnapshot();
	});
});
