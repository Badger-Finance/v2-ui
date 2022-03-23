import React from 'react';
import { BouncerType, Protocol, VaultBehavior, VaultDTO, VaultState, VaultType, VaultVersion } from '@badger-dao/sdk';
import { checkSnapshot } from '../utils/snapshots';
import VaultItemApr from '../../components-v2/landing/VaultItemApr';
import { customRender, fireEvent, screen } from '../Utils';
import store from '../../mobx/RootStore';
import { StoreProvider } from '../../mobx/store-context';
import { SAMPLE_VAULT } from 'tests/utils/samples';

const normalVault: VaultDTO = {
	available: 0,
	name: 'Badger',
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
	apy: 8.174287821972374,
	boost: {
		enabled: false,
		weight: 0,
	},
	sources: [
		{
			name: 'Vault Compounding',
			apr: 8.174287821972374,
			boostable: false,
			minApr: 8.174287821972374,
			maxApr: 8.174287821972374,
		},
	],
	sourcesApy: [
		{
			name: 'Vault Compounding',
			apr: 8.174287821972374,
			boostable: false,
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
	version: VaultVersion.v1,
	behavior: VaultBehavior.Compounder,
	yieldProjection: {
		yieldApr: 0,
		yieldTokens: [],
		yieldValue: 0,
		harvestApr: 0,
		harvestApy: 0,
		harvestTokens: [],
		harvestValue: 0,
	},
	lastHarvest: Date.now(),
};

describe('VaultItemApr', () => {
	describe('No APR Vaults', () => {
		it('renders zero APR', () => {
			checkSnapshot(<VaultItemApr boost={null} vault={{ ...normalVault, apr: 0 }} />);
		});
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('Boosted Vaults', () => {
		const sampleMultiplier = 0.020652602960278606;
		const mockUserBoost = 10;

		it('displays correct APR and boost information', () => {
			checkSnapshot(<VaultItemApr vault={SAMPLE_VAULT} boost={mockUserBoost} />);
		});

		it('displays APR breakdown on hover', async () => {
			jest.useFakeTimers();
			const { container } = customRender(
				<StoreProvider value={store}>
					<VaultItemApr vault={SAMPLE_VAULT} boost={mockUserBoost} />
				</StoreProvider>,
			);

			fireEvent.mouseOver(screen.getByText(`${mockUserBoost.toFixed(2)}%`));
			await screen.findByText(SAMPLE_VAULT.sourcesApy[0].name, { exact: false });
			jest.runAllTimers();
			expect(container).toMatchSnapshot();
		});
	});

	describe('Non-Boosted Vaults', () => {
		it('displays correct APR and boost information', () => {
			checkSnapshot(<VaultItemApr boost={null} vault={normalVault} />);
		});

		it('displays APR breakdown on hover', async () => {
			jest.useFakeTimers();
			const { container } = customRender(
				<StoreProvider value={store}>
					<VaultItemApr boost={null} vault={normalVault} />
				</StoreProvider>,
			);

			fireEvent.mouseOver(screen.getByText(`${normalVault.apr.toFixed(2)}%`));
			await screen.findByText(normalVault.sources[0].name, { exact: false });
			jest.runAllTimers();
			expect(container).toMatchSnapshot();
		});
	});
});
