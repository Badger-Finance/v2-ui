import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { StoreContext } from 'mobx/store-context';
import { scaleToString, Direction } from 'utils/componentHelpers';
import { ClawParam, INVALID_REASON } from '../index';
import BigNumber from 'bignumber.js';

dayjs.extend(utc);

const defaultWithdrawalDetails = {
	'Withdraw Speed': undefined,
	'Collateral Ratio - Global': undefined,
	'Collateral Ratio - Minimum': undefined,
	'Collateral Ratio - Current': undefined,
	Expiration: undefined,
	'Minimum Withdraw': undefined,
};

const defaultDepositDetails = {
	'Liquidation Price': undefined,
	'Collateral Ratio - Global': undefined,
	'Collateral Ratio - Minimum': undefined,
	'Collateral Ratio - Current': undefined,
	Expiration: undefined,
	'Minimum Deposit': undefined,
};

export function useError({ selectedOption, amount, error }: ClawParam): string {
	const { claw, contracts } = React.useContext(StoreContext);
	const selectedSynthetic = claw.syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency ?? ''];

	const collateralName = bToken ? claw.collaterals.get(bToken.address) : 'collateral token';
	const errors: string[] = [];
	if (!selectedOption) errors.push('Select a Token');
	if (!amount) errors.push('Enter an amount');
	if (error === INVALID_REASON.OVER_MAXIMUM) errors.push(`Amount exceeds ${collateralName} balance`);

	if (errors.length === 0) return '';

	return errors.reduce((a, b) => a || b);
}

export function useDetails(mode: string, manage: ClawParam) {
	const { claw, contracts, setts } = React.useContext(StoreContext);
	const isWithdraw = mode === 'withdraw';
	const synthetic = claw.syntheticsDataByEMP.get(manage.selectedOption || '');
	const price = synthetic && setts.getPrice(synthetic.collateralCurrency);
	const bToken = contracts.tokens[synthetic?.collateralCurrency ?? ''];

	if (!synthetic || !bToken || !price || !manage.amount) {
		return isWithdraw ? defaultWithdrawalDetails : defaultDepositDetails;
	}

	const { globalCollateralizationRatio, minSponsorTokens, collateralRequirement, expirationTimestamp } = synthetic;
	const precision = bToken.decimals || 18;
	const liquidationPrice = new BigNumber(manage.amount).multipliedBy(price);
	const currentCollateralRatio = liquidationPrice.dividedBy(manage.amount);

	const modeSpecificStats = {
		[isWithdraw ? 'Withdraw Speed' : 'Liquidation Price']: isWithdraw
			? 'Instant (Still Hardcoded)'
			: scaleToString(liquidationPrice, precision, Direction.Down),

		[isWithdraw ? 'Minimum Withdraw' : ' Minimum Deposit']: `${scaleToString(
			minSponsorTokens,
			precision,
			Direction.Down,
		)} CLAW`,
	};

	return {
		...modeSpecificStats,
		'Collateral Ratio - Global': `${scaleToString(globalCollateralizationRatio, precision, Direction.Down)}x`,
		'Collateral Ratio - Minimum': `${scaleToString(collateralRequirement, precision, Direction.Down)}x`,
		'Collateral Ratio - Current': `${currentCollateralRatio.toString()}x`,
		Expiration: `${dayjs(new Date(expirationTimestamp.toNumber() * 1000))
			.utc()
			.format('MMMM DD, YYYY HH:mm')} UTC`,
	};
}
