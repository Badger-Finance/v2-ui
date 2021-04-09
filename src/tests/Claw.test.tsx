import React from 'react';
import Web3 from 'web3';
import { customRender, fireEvent, screen, within } from './Utils';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store, { RootStore } from '../mobx/store';
import { Claw } from '../components/Claws/';
import { NETWORK_IDS, NETWORK_LIST } from 'config/constants';
import { Direction, scaleToString } from 'utils/componentHelpers';
import BigNumber from 'bignumber.js';
import { SyntheticData, Token } from 'mobx/model';

// custom RPC server with a mainnet fork that where we have the contracts deployed
const clawRpcProvider = new Web3.providers.HttpProvider('http://18.230.192.200:8545');
const collateralAmountToUse = '100.00';
const syntheticAmountToUse = '150.00';

describe('Claw Page', () => {
	const testingStore = store;

	beforeAll(() => {
		testingStore.wallet.provider = clawRpcProvider;
		testingStore.wallet.connectedAddress = '0xC26202cd0428276cC69017Df01137161f0102e55';
		testingStore.wallet.network.name = NETWORK_LIST.ETH;
		testingStore.wallet.network.networkId = NETWORK_IDS.ETH;
		testingStore.contracts.tokens = mockTokens;
		testingStore.claw.collaterals = mockCollaterals;
		testingStore.claw.syntheticsData = mockSyntheticData;
		testingStore.claw.syntheticsDataByEMP = mockSyntheticDataByEmp;
		testingStore.claw.clawsByCollateral = mockClawsByCollaterals;
		testingStore.setts.setPrices(mockPrices);
	});

	it('matches snapshot', () => {
		const { container } = customRender(
			<StoreProvider value={testingStore}>
				<Claw />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	describe('Collateral inputs work fine', () => {
		beforeEach(() => renderClawPageWithStore(testingStore));

		it('disables amount inputs at the start', () => {
			const [collateralAmount] = screen.getAllByRole('textbox');
			expect(collateralAmount).toBeDisabled();
		});

		it('disables percentage buttons', () => {
			const [fiftyPercentCollateralButton] = screen.getAllByRole('button', {
				name: '50%',
			});
			expect(fiftyPercentCollateralButton).toBeDisabled();
		});

		it('disables action button and display "Select a Collateral Token" message', () => {
			expect(screen.getByRole('button', { name: 'Select a Collateral Token' })).toBeDisabled();
		});

		describe('Interaction works fine', () => {
			// Select a collateral token
			beforeEach(() => {
				const collateralToken = getCollateralToken(testingStore);
				const collateralTokenSelector = screen.getByRole('button', { name: 'Select Token' });

				// Click the collateral options list
				fireEvent.mouseDown(collateralTokenSelector);
				const collateralsListBox = within(screen.getByRole('listbox'));
				// Select the collateral token from the list
				fireEvent.click(collateralsListBox.getByText(collateralToken.name));
			});

			it('selects collateral', () => {
				const collateralToken = getCollateralToken(testingStore);
				const [collateralAmountInput] = screen.getAllByRole('textbox');

				// The button with the collateral token name should appear
				expect(
					screen.getByRole('button', {
						name: collateralToken.name,
					}),
				).toBeInTheDocument();

				// The amount inputs and percentage buttons should be enabled too
				expect(collateralAmountInput).toBeEnabled();
			});

			it('displays balance', () => {
				const collateralToken = getCollateralToken(testingStore);
				const tokenBalance = scaleToString(collateralToken.balance, collateralToken.decimals, Direction.Down);
				expect(screen.getByText(tokenBalance)).toBeInTheDocument();
			});

			it('changes amount', () => {
				const [collateralAmountInput] = screen.getAllByRole('textbox');

				// Enter value 100 in the input and check it changes correspondingly
				fireEvent.change(collateralAmountInput, { target: { value: collateralAmountToUse } });
				expect(screen.getByDisplayValue(collateralAmountToUse)).toBeInTheDocument();
			});

			it('applies percentage', () => {
				const collateralToken = getCollateralToken(testingStore);
				const fiftyPercentTokenBalance = collateralToken.balance
					.multipliedBy(50 / 100)
					.dividedBy(10 ** collateralToken.decimals)
					.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN);

				const [fiftyPercentCollateralButton] = screen.getAllByRole('button', {
					name: '50%',
				});

				expect(fiftyPercentCollateralButton).toBeEnabled();
				fireEvent.click(fiftyPercentCollateralButton);
				expect(screen.getByDisplayValue(fiftyPercentTokenBalance)).toBeInTheDocument();
			});
		});
	});

	describe('Synthetic inputs work fine', () => {
		beforeEach(() => renderClawPageWithStore(testingStore));

		it('disables amount input at start', () => {
			expect(screen.getByRole('button', { name: 'Select CLAW' })).toHaveAttribute('aria-disabled');
		});

		it('disables percentage buttons', () => {
			const [, fiftyPercentSyntheticButton] = screen.getAllByRole('button', {
				name: '50%',
			});
			expect(fiftyPercentSyntheticButton).toBeDisabled();
		});

		describe('Interaction with collateral inputs work fine', () => {
			beforeEach(() => {
				const collateralToken = getCollateralToken(testingStore);
				const collateralTokenSelector = screen.getByRole('button', { name: 'Select Token' });
				const [collateralAmountInput] = screen.getAllByRole('textbox');

				// Click the collateral options list
				fireEvent.mouseDown(collateralTokenSelector);
				const collateralsListBox = within(screen.getByRole('listbox'));
				// Select the collateral token from the list
				fireEvent.click(collateralsListBox.getByText(collateralToken.name));
				fireEvent.change(collateralAmountInput, { target: { value: '100' } });
			});

			it('enables selector upon collateral selection', () => {
				expect(screen.getByRole('button', { name: 'Select CLAW' })).toBeEnabled();
			});

			describe('Inputs interactions work fine', () => {
				beforeEach(() => {
					const synthetic = getSynthetic(testingStore);
					const syntheticSelector = screen.getByRole('button', { name: 'Select CLAW' });

					// Click the collateral options list
					fireEvent.mouseDown(syntheticSelector);
					const collateralsListBox = within(screen.getByRole('listbox'));
					// Select the synthetic from the list
					fireEvent.click(collateralsListBox.getByText(synthetic.name));
				});

				it('selects synthetic', () => {
					const synthetic = getSynthetic(testingStore);
					const [, syntheticAmountInput] = screen.getAllByRole('textbox');

					// The button with the collateral token name should appear
					expect(
						screen.getByRole('button', {
							name: synthetic.name,
						}),
					).toBeInTheDocument();

					// The amount inputs and percentage buttons should be enabled too
					expect(syntheticAmountInput).toBeEnabled();
				});

				it('displays correct max eCLAW', () => {
					const collateralToken = getCollateralToken(testingStore);
					const synthetic = getSynthetic(testingStore);
					const maxClaw = getMaxEclaw(collateralToken, synthetic);
					const maxClawText = scaleToString(maxClaw, collateralToken.decimals, Direction.Down);

					expect(screen.getByText(maxClawText)).toBeInTheDocument();
				});

				it('changes amount', () => {
					const [, syntheticAmountInput] = screen.getAllByRole('textbox');
					// Enter value 100 in the input and check it changes correspondingly
					fireEvent.change(syntheticAmountInput, { target: { value: syntheticAmountToUse } });
					expect(screen.getByDisplayValue(syntheticAmountToUse)).toBeInTheDocument();
				});

				it('Applies percentage', () => {
					const collateralToken = getCollateralToken(testingStore);
					const synthetic = getSynthetic(testingStore);
					const maxClaw = getMaxEclaw(collateralToken, synthetic);

					const fiftyPercentClaw = maxClaw
						.multipliedBy(50 / 100)
						.dividedBy(10 ** collateralToken.decimals)
						.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN);

					const [, fiftyPercentSyntheticButton] = screen.getAllByRole('button', {
						name: '50%',
					});

					expect(fiftyPercentSyntheticButton).toBeEnabled();
					fireEvent.click(fiftyPercentSyntheticButton);
					expect(screen.getByDisplayValue(fiftyPercentClaw)).toBeInTheDocument();
				});
			});
		});
	});
});

const mockTokens = {
	'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': getMockBbadger(),
	'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': getMockBslp(),
};

const mockPrices = {
	'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': new BigNumber('0x59d594da1e8964'),
	'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': new BigNumber('0x14defd105b0a8483de8a00'),
};

const mockCollaterals = new Map(
	Object.entries({
		'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': 'bBADGER',
		'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': 'bSLP',
	}),
);

const mockSyntheticData = [
	{
		address: '0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220',
		collateralCurrency: '0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28',
		collateralRequirement: new BigNumber('0x10a741a462780000'),
		cumulativeFeeMultiplier: new BigNumber('0xde0b6b3a7640000'),
		expirationTimestamp: new BigNumber('0x60b2b960'),
		expiryPrice: new BigNumber('0x0'),
		globalCollateralizationRatio: new BigNumber('0x45d0deb866855'),
		liquidationLiveness: new BigNumber('0x1c20'),
		minSponsorTokens: new BigNumber('0x56bc75e2d63100000'),
		name: 'USD/bBadger 5-29',
		tokenCurrency: '0xA62F77D4b97Dc1CAE56C90517394Ce7554B1399A',
		totalPositionCollateral: new BigNumber('0x2f1025aba69135558'),
		totalTokensOutstanding: new BigNumber('0x95ae4b16411dadf45c3'),
		withdrawalLiveness: new BigNumber('0x1c20'),
	},
	{
		address: '0x5E4a8D011ef8d9E8B407cc87c68bD211B7ac72ab',
		collateralCurrency: '0x758A43EE2BFf8230eeb784879CdcFF4828F2544D',
		collateralRequirement: new BigNumber('0x10a741a462780000'),
		cumulativeFeeMultiplier: new BigNumber('0xde0b6b3a7640000'),
		expirationTimestamp: new BigNumber('0x60b2b960'),
		expiryPrice: new BigNumber('0x0'),
		globalCollateralizationRatio: new BigNumber('0x1f8620'),
		liquidationLiveness: new BigNumber('0x1c20'),
		minSponsorTokens: new BigNumber('0x56bc75e2d63100000'),
		name: 'USD-[bwBTC/ETH SLP] 5-29',
		tokenCurrency: '0xada279f9301C01A4eF914127a6C2a493Ad733924',
		totalPositionCollateral: new BigNumber('0x24291325f9'),
		totalTokensOutstanding: new BigNumber('0xfeb3eb2cdc7a63c0000'),
		withdrawalLiveness: new BigNumber('0x1c20'),
	},
];

const mockSyntheticDataByEmp = new Map(
	Object.entries({
		'0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220': mockSyntheticData[0],
		'0x5E4a8D011ef8d9E8B407cc87c68bD211B7ac72ab': mockSyntheticData[1],
	}),
);

const mockClawsByCollaterals = new Map(
	Object.entries({
		'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': new Map(
			Object.entries({
				'0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220': 'USD/bBadger 5-29',
			}),
		),
		'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': new Map(
			Object.entries({
				'0x5E4a8D011ef8d9E8B407cc87c68bD211B7ac72ab': 'USD-[bwBTC/ETH SLP] 5-29',
			}),
		),
	}),
);

function renderClawPageWithStore(store: RootStore) {
	customRender(
		<StoreProvider value={store}>
			<Claw />
		</StoreProvider>,
	);
}

function getMockBbadger() {
	const bBadger = new Token(store, '0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28', 18);

	bBadger.update({
		balanceOf: new BigNumber('0x1c5174fe8b9cb5edbe'),
		decimals: 18,
		ethValue: new BigNumber('0x540f9e84667ab3'),
		name: 'bBADGER',
		symbol: 'bBADGER',
		totalSupply: new BigNumber('0x29130e4d1919f70d5fdf4'),
		position: 0,
		growth: [],
		balance: [],
		getPricePerFullShare: new BigNumber('0'),
		isSuperSett: false,
	});

	return bBadger;
}

function getMockBslp() {
	const bSlp = new Token(store, '0x758A43EE2BFf8230eeb784879CdcFF4828F2544D', 18);

	bSlp.update({
		balanceOf: new BigNumber('0x10f12354d6'),
		decimals: 18,
		ethValue: new BigNumber('0x14f38077bed256b2bf2800'),
		name: 'bSLP',
		symbol: 'bSLP',
		totalSupply: new BigNumber('0xd7c8d3d367121'),
		position: 0,
		growth: [],
		balance: [],
		getPricePerFullShare: new BigNumber('0'),
		isSuperSett: false,
	});

	return bSlp;
}

function getCollateralToken(store: RootStore) {
	const collateralOptions = store.claw.collaterals;
	const [collateralAddress] = Array.from(collateralOptions.keys());
	const collateralToken = store.contracts.tokens[collateralAddress];

	if (!collateralToken) {
		throw new Error(`Collateral Token not found for address ${collateralAddress}`);
	}

	return collateralToken;
}

function getSynthetic(store: RootStore) {
	const collateral = getCollateralToken(store);
	const syntheticOptions = store.claw.clawsByCollateral.get(collateral.address);
	const [syntheticAddress] = Array.from(syntheticOptions?.keys() ?? []);
	const synthetic = store.claw.syntheticsDataByEMP.get(syntheticAddress);

	if (!synthetic) {
		throw new Error(`Synthetic with addres:${syntheticAddress} from collateral: ${collateral.address} not found`);
	}

	return synthetic;
}

function getMaxEclaw(collateral: Token, synthetic: SyntheticData) {
	const precision = 10 ** collateral.decimals;
	const { globalCollateralizationRatio, cumulativeFeeMultiplier, collateralRequirement } = synthetic;
	const ratio = globalCollateralizationRatio.isZero() ? collateralRequirement : globalCollateralizationRatio;

	return new BigNumber(collateralAmountToUse)
		.multipliedBy(precision)
		.multipliedBy(cumulativeFeeMultiplier)
		.dividedBy(ratio);
}
