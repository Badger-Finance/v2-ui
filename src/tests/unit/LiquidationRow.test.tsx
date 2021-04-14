import React from 'react';
import '@testing-library/jest-dom';
import { screen, fireEvent, customRender } from '../Utils';
import BigNumber from 'bignumber.js';
import { LiquidationRow } from '../../components/Claw/Liquidations/LiquidationRow';
import { LiquidationStatus } from '../../mobx/model';

const synthetic = {
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
};

const liquidation = {
	state: 'Uninitialized',
	liquidationTime: new BigNumber(1618072065),
	tokensOutstanding: new BigNumber('100.123456789123456789123').multipliedBy(10 ** 18),
	lockedCollateral: new BigNumber('100.123456789123456789123').multipliedBy(10 ** 18),
	sponsor: '0xC26202cd0428276cC69017Df01137161f0102e55',
	liquidator: '0xC26202cd0428226cC69017Da01137161f0104da22',
	liquidatedCollateral: new BigNumber('122.123456789123456789').multipliedBy(10 ** 18),
	rawUnitCollateral: new BigNumber('100.123456789123456789123').multipliedBy(10 ** 18),
	disputer: '0xC26202cd0428276cC69017Df01137161f0102e55',
	settlementPrice: new BigNumber('111.123456789123456789').multipliedBy(10 ** 18),
	finalFee: new BigNumber(33),
};

it('displays liquidation information', () => {
	customRender(<LiquidationRow liquidation={liquidation} synthetic={synthetic} decimals={18} onClick={jest.fn()} />);
	expect(screen.getByText('USD/bBadger 5-29')).toBeInTheDocument();
	expect(screen.getByText('111.123456789123456789')).toBeInTheDocument();
	expect(screen.getByText('/122.123456789123456789')).toBeInTheDocument();
	expect(screen.getByText('Apr 10, 2021')).toBeInTheDocument();
});

it('can be clicked', () => {
	const handleClick = jest.fn();
	customRender(
		<LiquidationRow liquidation={liquidation} synthetic={synthetic} decimals={18} onClick={handleClick} />,
	);
	fireEvent.click(screen.getByText('USD/bBadger 5-29'));
	expect(handleClick).toHaveBeenCalledTimes(1);
});

describe('displays correct liquidation status', () => {
	test('displays uninitialized text and hover information', () => {
		customRender(
			<LiquidationRow
				liquidation={{
					...liquidation,
					state: LiquidationStatus.Uninitialized,
				}}
				synthetic={synthetic}
				decimals={18}
				onClick={jest.fn()}
			/>,
		);
		expect(screen.getByText('Uninitialized')).toBeInTheDocument();
		fireEvent.mouseOver(screen.getByRole('button'));
		expect(screen.getByTitle('The liquidation is yet to be initialized')).toBeInTheDocument();
	});

	test('displays pre-dispute text and hover information', () => {
		customRender(
			<LiquidationRow
				liquidation={{
					...liquidation,
					state: LiquidationStatus.PreDispute,
					liquidationTime: new BigNumber(32512658672),
				}}
				synthetic={synthetic}
				decimals={18}
				onClick={jest.fn()}
			/>,
		);
		expect(screen.getByText('Pre Dispute')).toBeInTheDocument();
		fireEvent.mouseOver(screen.getByRole('button'));
		expect(screen.getByTitle('The liquidation is about to be disputed')).toBeInTheDocument();
	});

	test('displays pending dispute text and hover information', () => {
		customRender(
			<LiquidationRow
				liquidation={{
					...liquidation,
					state: LiquidationStatus.PendingDispute,
				}}
				synthetic={synthetic}
				decimals={18}
				onClick={jest.fn()}
			/>,
		);
		expect(screen.getByText('Pending Dispute')).toBeInTheDocument();
		fireEvent.mouseOver(screen.getByRole('button'));
		expect(screen.getByTitle('The liquidation is being disputed')).toBeInTheDocument();
	});

	test('displays dispute failed text and hover information', () => {
		customRender(
			<LiquidationRow
				liquidation={{
					...liquidation,
					state: LiquidationStatus.DisputeFailed,
				}}
				synthetic={synthetic}
				decimals={18}
				onClick={jest.fn()}
			/>,
		);
		expect(screen.getByText('Dispute Failed')).toBeInTheDocument();
		fireEvent.mouseOver(screen.getByRole('button'));
		expect(screen.getByTitle('The liquidation dispute got rejected')).toBeInTheDocument();
	});

	test('displays dispute succeed text and hover information', () => {
		customRender(
			<LiquidationRow
				liquidation={{
					...liquidation,
					state: LiquidationStatus.DisputeSucceeded,
				}}
				synthetic={synthetic}
				decimals={18}
				onClick={jest.fn()}
			/>,
		);
		expect(screen.getByText('Dispute Succeed')).toBeInTheDocument();
		fireEvent.mouseOver(screen.getByRole('button'));
		expect(screen.getByTitle('The liquidation dispute got approved')).toBeInTheDocument();
	});

	test('displays complete liquidation information and completion time', () => {
		customRender(
			<LiquidationRow
				liquidation={{
					...liquidation,
					state: LiquidationStatus.PreDispute,
				}}
				synthetic={synthetic}
				decimals={18}
				onClick={jest.fn()}
			/>,
		);
		expect(screen.getByText('Complete - Apr 10, 2021')).toBeInTheDocument();
	});
});
