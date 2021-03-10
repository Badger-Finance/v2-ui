import React from 'react';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { StoreContext } from 'mobx/store-context';
import { ClawParam, INVALID_REASON } from '..';

dayjs.extend(utc);

export function useError({ selectedOption, amount, error }: ClawParam) {
	const { claw, contracts } = React.useContext(StoreContext);
	const synthetic = claw.syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[synthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];

	const tokenError = !bToken && 'Select a token';
	const amountError = !amount && 'Enter an amount';
	const collateralError = error === INVALID_REASON.OVER_MAXIMUM && 'Insufficient Collateral';

	return collateralError || tokenError || amountError;
}

export function useDetails({ selectedOption }: ClawParam) {
	const { claw, contracts } = React.useContext(StoreContext);
	const synthetic = claw.syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[synthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];

	if (!synthetic || !bToken) {
		return {
			'Expiration Date': '-',
			'Expiration Price': '-',
		};
	}

	const { expirationTimestamp } = synthetic;
	const formattedDate = dayjs(new Date(expirationTimestamp.toNumber() * 1000))
		.utc()
		.format('MMMM DD, YYYY HH:mm');

	return {
		'Expiration Date': `${formattedDate} UTC`,
		'Expiration Price': `1 ${claw.collaterals.get(bToken.address)} = .000001 wBTCWethSLP (Still Hardcoded)`,
	};
}

export function useAmountToReceive({ selectedOption, amount }: ClawParam) {
	const { claw } = React.useContext(StoreContext);
	const synthetic = claw.syntheticsDataByEMP.get(selectedOption || '');
	const userEmpInformation = claw.sponsorInformationByEMP.get(selectedOption || '');

	if (!amount || !userEmpInformation || !synthetic) return;

	const { tokensOutstanding, rawCollateral } = userEmpInformation.position;
	const fractionRedeemed = new BigNumber(amount).dividedBy(tokensOutstanding);
	const feeAdjustedCollateral = rawCollateral.multipliedBy(synthetic.cumulativeFeeMultiplier);

	return fractionRedeemed.multipliedBy(feeAdjustedCollateral);
}
