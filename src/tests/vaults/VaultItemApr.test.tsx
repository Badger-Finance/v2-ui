import React from 'react';
import { BouncerType, Protocol, Vault, VaultState, VaultType } from '@badger-dao/sdk';
import { checkSnapshot } from '../utils/snapshots';
import { VaultItemApr } from '../../components-v2/landing/VaultItemApr';
import { customRender, fireEvent, screen } from '../Utils';
import store from '../../mobx/RootStore';
import { StoreProvider } from '../../mobx/store-context';
import * as ComponentHelpers from '../../utils/componentHelpers';

const boostedVault: Vault = {
	name: 'ibBTC / crvsBTC LP',
	newVault: true,
	asset: 'crvibBTC',
	vaultAsset: 'bcrvibBTC',
	state: VaultState.Open,
	underlyingToken: '0xFbdCA68601f835b27790D98bbb8eC7f05FDEaA9B',
	vaultToken: '0xaE96fF08771a109dc6650a1BdCa62F2d558E40af',
	value: 41931.75180585348,
	balance: 3178.06787828893,
	protocol: Protocol.Convex,
	pricePerFullShare: 1,
	tokens: [
		{
			value: 20094.268952577364,
			address: '0x8751D4196027d4e6DA63716fA7786B5174F04C15',
			name: 'wibBTC',
			symbol: 'wibBTC',
			decimals: 18,
			balance: 1498.3866834755574,
		},
		{
			value: 21837.482853276113,
			address: '0x000000000000000000000000000000000000000175b1bb99792c9E1041bA13afEf80C91a1e70fB3',
			name: 'Curve.fi renBTC/wBTC/sBTC',
			symbol: 'crvsBTC',
			decimals: 18,
			balance: 1666.1554813267362,
		},
	],
	apr: 19.16862206903562,
	boost: {
		enabled: true,
		weight: 10000,
	},
	minApr: 9.461123356709754,
	maxApr: 61.652732126597286,
	sources: [
		{
			name: 'Curve LP Fees',
			apr: 0.05773875239807311,
			boostable: false,
			harvestable: false,
			performance: {
				oneDay: 0.05773875239807311,
				threeDay: 0.05773875239807311,
				sevenDay: 0.05773875239807311,
				thirtyDay: 0.05773875239807311,
			},
			minApr: 0.05773875239807311,
			maxApr: 0.05773875239807311,
		},
		{
			name: 'bCVXCRV Rewards',
			apr: 3.6637832355582183,
			boostable: false,
			harvestable: false,
			performance: {
				oneDay: 3.6637832355582183,
				threeDay: 3.6637832355582183,
				sevenDay: 3.6637832355582183,
				thirtyDay: 3.6637832355582183,
			},
			minApr: 3.6637832355582183,
			maxApr: 3.6637832355582183,
		},
		{
			name: 'Boosted Badger Rewards',
			apr: 9.733607571140217,
			boostable: true,
			harvestable: false,
			performance: {
				oneDay: 9.733607571140217,
				threeDay: 9.733607571140217,
				sevenDay: 9.733607571140217,
				thirtyDay: 9.733607571140217,
			},
			minApr: 0.02610885881435094,
			maxApr: 52.217717628701884,
		},
		{
			name: 'bveCVX Rewards',
			apr: 5.713492509939111,
			boostable: false,
			harvestable: false,
			performance: {
				oneDay: 5.713492509939111,
				threeDay: 5.713492509939111,
				sevenDay: 5.713492509939111,
				thirtyDay: 5.713492509939111,
			},
			minApr: 5.713492509939111,
			maxApr: 5.713492509939111,
		},
	],
	bouncer: BouncerType.None,
	strategy: {
		address: '0x6D4BA00Fd7BB73b5aa5b3D6180c6f1B0c89f70D1',
		withdrawFee: 10,
		performanceFee: 2000,
		strategistFee: 0,
	},
	type: VaultType.Boosted,
};

const normalVault: Vault = {
	name: 'Badger',
	newVault: false,
	asset: 'Badger',
	vaultAsset: 'bBadger',
	state: VaultState.Open,
	underlyingToken: '0x0000000000000000000000000000000000000001',
	vaultToken: '0x0000000000000000000000000000000000000001',
	value: 10000,
	balance: 100,
	protocol: Protocol.Badger,
	pricePerFullShare: 0.18907615705168573,
	tokens: [
		{
			address: '0x0000000000000000000000000000000000000001',
			name: 'Badger',
			symbol: 'BADGER',
			decimals: 10,
			balance: 100,
			value: 10000,
		},
	],
	apr: 8.174287821972374,
	boost: {
		enabled: false,
		weight: 0,
	},
	sources: [
		{
			name: 'Vault Compounding',
			apr: 8.174287821972374,
			boostable: false,
			harvestable: false,
			performance: {
				oneDay: 0,
				threeDay: 2.5464786033167146e-7,
				sevenDay: 3.344828765174996e-7,
				thirtyDay: 8.174287821972374,
			},
			minApr: 8.174287821972374,
			maxApr: 8.174287821972374,
		},
	],
	bouncer: BouncerType.None,
	strategy: {
		address: '0x4a8651F2edD68850B944AD93f2c67af817F39F62',
		withdrawFee: 0,
		performanceFee: 0,
		strategistFee: 0,
	},
	type: VaultType.Native,
};

describe('VaultItemApr', () => {
	describe('No APR Vaults', () => {
		it('renders zero APR', () => {
			checkSnapshot(<VaultItemApr vault={{ ...normalVault, apr: 0 }} />);
		});
	});

	describe('Boosted Vaults', () => {
		const sampleMultiplier = 0.020652602960278606;
		const mockUserBoost = 10;

		beforeEach(() => {
			jest.spyOn(ComponentHelpers, 'getUserVaultBoost').mockReturnValue(mockUserBoost);
		});

		it('displays correct APR and boost information', () => {
			checkSnapshot(<VaultItemApr vault={boostedVault} boost={1} multiplier={sampleMultiplier} />);
		});

		it('displays APR breakdown on hover', async () => {
			const { container } = customRender(
				<StoreProvider value={store}>
					<VaultItemApr vault={boostedVault} boost={1} multiplier={sampleMultiplier} />
				</StoreProvider>,
			);

			fireEvent.mouseOver(screen.getByText(`${mockUserBoost.toFixed(2)}%`));
			await screen.findByText(boostedVault.sources[0].name, { exact: false });
			expect(container).toMatchSnapshot();
		});
	});

	describe('Non-Boosted Vaults', () => {
		it('displays correct APR and boost information', () => {
			checkSnapshot(<VaultItemApr vault={normalVault} />);
		});

		it('displays APR breakdown on hover', async () => {
			const { container } = customRender(
				<StoreProvider value={store}>
					<VaultItemApr vault={normalVault} />
				</StoreProvider>,
			);

			fireEvent.mouseOver(screen.getByText(`${normalVault.apr.toFixed(2)}%`));
			await screen.findByText(normalVault.sources[0].name, { exact: false });
			expect(container).toMatchSnapshot();
		});
	});
});
