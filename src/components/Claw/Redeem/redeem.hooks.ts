import React from 'react';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { StoreContext } from 'mobx/store-context';

import { TEN } from 'config/constants';
import { ClawActionDetail, ClawParam } from '../claw.model';
import { BOUNDARY_ERROR } from 'utils/componentHelpers';

dayjs.extend(utc);

export function useError({ selectedOption, amount, error }: ClawParam): string | false {
	const { claw, contracts } = React.useContext(StoreContext);
	const synthetic = claw.syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[synthetic?.collateralCurrency ?? ''];

	const tokenError = !bToken && 'Select a Token';
	const amountError = !amount && 'Enter an amount';
	const collateralAmountError = error === BOUNDARY_ERROR.UNDER && 'Insufficient Collateral';
	const collateralBalanceError = error === BOUNDARY_ERROR.OVER && 'Insufficient Collateral Balance';

	return collateralAmountError || collateralBalanceError || tokenError || amountError;
}

export function useDetails({ selectedOption }: ClawParam): ClawActionDetail[] {
	const { claw, contracts } = React.useContext(StoreContext);
	const synthetic = claw.syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[synthetic?.collateralCurrency ?? ''];

	if (!synthetic || !bToken) {
		return [{ name: 'Expiration Date' }, { name: 'Expiration Price' }];
	}

	const { expirationTimestamp, expiryPrice } = synthetic;

	// expiry price is zero if synthetic is not expired yet
	const expirationPrice = expiryPrice.isGreaterThan(0)
		? `1 ${claw.collaterals.get(bToken.address)} = ${expiryPrice.toString()} ${synthetic.name}`
		: '-';

	const formattedDate = dayjs(expirationTimestamp.toNumber() * 1000).format('MMMM DD, YYYY HH:mm');

	return [
		{ name: 'Expiration Date', text: `${formattedDate} UTC` },
		{
			name: 'Expiration Price',
			text: expirationPrice,
		},
	];
}

export function useAmountToReceive({ selectedOption, amount }: ClawParam, decimals: number): BigNumber {
	const { claw } = React.useContext(StoreContext);
	const synthetic = claw.syntheticsDataByEMP.get(selectedOption || '');
	const userEmpInformation = claw.sponsorInformationByEMP.get(selectedOption || '');

	if (!amount || !userEmpInformation || !synthetic) return new BigNumber(0);

	const { tokensOutstanding, rawCollateral } = userEmpInformation.position;
	const fractionRedeemed = new BigNumber(amount).multipliedBy(10 ** decimals).dividedBy(tokensOutstanding);
	const feeAdjustedCollateral = rawCollateral.multipliedBy(
		synthetic.cumulativeFeeMultiplier.dividedBy(TEN.pow(decimals)),
	);

	return fractionRedeemed.multipliedBy(feeAdjustedCollateral);
}
