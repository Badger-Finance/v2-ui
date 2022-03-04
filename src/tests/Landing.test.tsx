import React from 'react';
import Landing from '../pages/Landing';
import '@testing-library/jest-dom';
import store from '../mobx/RootStore';
import { checkSnapshot } from './utils/snapshots';
import BigNumber from 'bignumber.js';
import UserStore from 'mobx/stores/UserStore';
import { createMatchMedia } from './Utils';
import VaultStore from '../mobx/stores/VaultStore';
import { SAMPLE_VAULTS } from './utils/samples';

describe('Landing', () => {
	beforeEach(() => {
		store.prices.getPrice = jest.fn().mockReturnValue(new BigNumber(15e18));
		store.network.network.deploy.token = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
		store.onboard.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		store.user.accountDetails = {
			address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
			value: 0,
			earnedValue: 0,
			data: {},
			boost: 1,
			boostRank: 251,
			multipliers: {
				'0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': 1,
			},
			nativeBalance: 100,
			nonNativeBalance: 10,
			stakeRatio: 100,
			claimableBalances: {},
			nftBalance: 0,
			bveCvxBalance: 0,
			rank: 1,
		};

		jest.spyOn(UserStore.prototype, 'initialized', 'get').mockReturnValue(true);
		jest.spyOn(UserStore.prototype, 'portfolioValue', 'get').mockReturnValue(new BigNumber(1000));
		jest.spyOn(VaultStore.prototype, 'getVaultOrder').mockReturnValue(SAMPLE_VAULTS);

		jest.spyOn(VaultStore.prototype, 'vaultsDefinitions', 'get').mockReturnValue(
			new Map(
				SAMPLE_VAULTS.map((vault) => [
					vault.vaultToken,
					{
						depositToken: { address: vault.underlyingToken, decimals: 18 },
						vaultToken: { address: vault.vaultToken, decimals: 18 },
					},
				]),
			),
		);
	});

	test('Renders correctly', async () => {
		checkSnapshot(<Landing title="Test Bitcoin Strategies" subtitle="Snapshots are great. Landing looks good." />);
	});

	test('Renders tablet version correctly', () => {
		window.matchMedia = createMatchMedia(900);
		checkSnapshot(<Landing title="Test Bitcoin Strategies" subtitle="Snapshots are great. Landing looks good." />);
	});

	test('Renders mobile version correctly', () => {
		window.matchMedia = createMatchMedia(480);
		checkSnapshot(<Landing title="Test Bitcoin Strategies" subtitle="Snapshots are great. Landing looks good." />);
	});
});
