import React from 'react';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';
import { screen, fireEvent, customRender } from '../Utils';
import { Withdrawal } from '../../components/Claw/Withdrawals/Withdrawal';

const position = {
	rawCollateral: new BigNumber('0x2f1025aba69135558'),
	tokensOutstanding: new BigNumber('0x95ae4b16411dadf45c3'),
	withdrawalRequestAmount: new BigNumber('0x2f1025aba69135558'),
	withdrawalRequestPassTimestamp: new BigNumber('0x606ba2e3'),
};

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

it('displays position and synthetic information', () => {
	customRender(
		<Withdrawal
			position={position}
			synthetic={synthetic}
			decimals={18}
			onWithdraw={jest.fn()}
			onCancel={jest.fn()}
		/>,
	);
	expect(screen.getByText('USD/bBadger 5-29')).toBeInTheDocument();
	expect(screen.getByText('54.260031017186448728')).toBeInTheDocument();
	expect(screen.getByText('Apr 05, 2021 @ 19:53 UTC')).toBeInTheDocument();
});

it('displays cancel button and triggers cancel action on not expired withdrawals', () => {
	const handleWithdraw = jest.fn();
	const handleCancel = jest.fn();
	customRender(
		<Withdrawal
			position={position}
			synthetic={synthetic}
			decimals={18}
			onWithdraw={handleWithdraw}
			onCancel={handleWithdraw}
		/>,
	);
	expect(screen.getByRole('button', { name: /Withdraw/i })).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: /Withdraw/i }));
	expect(handleCancel).not.toHaveBeenCalled();
	expect(handleWithdraw).toHaveBeenNthCalledWith(1, '0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220');
});

it('displays withdraw button and triggers withdraw action on not expired withdrawals', () => {
	const handleCancel = jest.fn();
	const handleWithdraw = jest.fn();
	customRender(
		<Withdrawal
			// expiry time on year 3000
			position={{ ...position, withdrawalRequestPassTimestamp: new BigNumber('32513155572000') }}
			synthetic={synthetic}
			decimals={18}
			onWithdraw={handleWithdraw}
			onCancel={handleCancel}
		/>,
	);
	expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
	expect(handleWithdraw).not.toHaveBeenCalled();
	expect(handleCancel).toHaveBeenNthCalledWith(1, '0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220');
});
