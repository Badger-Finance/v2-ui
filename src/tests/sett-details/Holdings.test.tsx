import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import {
	SAMPLE_BADGER_SETT,
	SAMPLE_VAULT,
	SAMPLE_VAULT_BALANCE,
	SAMPLE_TOKEN_BALANCE,
	SAMPLE_EXCHANGES_RATES,
} from '../utils/samples';
import { Holdings } from '../../components-v2/vault-detail/holdings/Holdings';
import UserStore from '../../mobx/stores/UserStore';
import store from '../../mobx/RootStore';

describe('Holdings', () => {
	beforeEach(() => {
		jest.spyOn(UserStore.prototype, 'getTokenBalance').mockReturnValue(SAMPLE_TOKEN_BALANCE);
		store.prices.exchangeRates = SAMPLE_EXCHANGES_RATES;
	});

	it('displays holdings with no balance', () => {
		checkSnapshot(
			<Holdings
				vault={SAMPLE_VAULT}
				badgerVault={SAMPLE_BADGER_SETT}
				userData={SAMPLE_VAULT_BALANCE}
				tokenBalance={SAMPLE_TOKEN_BALANCE}
			/>,
		);
	});

	it('displays holdings with balance', () => {
		jest.spyOn(UserStore.prototype, 'getTokenBalance').mockReturnValue(SAMPLE_TOKEN_BALANCE);
		checkSnapshot(
			<Holdings
				vault={SAMPLE_VAULT}
				badgerVault={SAMPLE_BADGER_SETT}
				userData={SAMPLE_VAULT_BALANCE}
				tokenBalance={SAMPLE_TOKEN_BALANCE}
			/>,
		);
	});
});
