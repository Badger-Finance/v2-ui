import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { StoreContext } from 'mobx/store-context';
import { ClawParam, INVALID_REASON } from '../index';

dayjs.extend(utc);

const defaultWithdrawalDetails = {
	'Withdraw Speed': '-',
	'Collateral Ratio - Global': '-',
	'Collateral Ratio - Minimum': '-',
	'Collateral Ratio - Current': '-',
	Expiration: '-',
	'Minimum Withdraw': '-',
};

const defaultDepositDetails = {
	'Liquidation Price': '-',
	'Collateral Ratio - Global': '-',
	'Collateral Ratio - Minimum': '-',
	'Collateral Ratio - Current': '-',
	Expiration: '-',
	'Minimum Deposit': '-',
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
	const { claw, contracts } = React.useContext(StoreContext);
	const isWithdraw = mode === 'withdraw';
	const synthetic = claw.syntheticsDataByEMP.get(manage.selectedOption || '');
	const bToken = contracts.tokens[synthetic?.collateralCurrency ?? ''];

	if (!synthetic || !bToken) return isWithdraw ? defaultWithdrawalDetails : defaultDepositDetails;

	const { globalCollateralizationRatio, minSponsorTokens, collateralRequirement, expirationTimestamp } = synthetic;
	const precision = 10 ** bToken.decimals;

	const modeSpecificStats = {
		[isWithdraw ? 'Withdraw Speed' : 'Liquidation Price']: isWithdraw
			? 'Instant (Still Hardcoded)'
			: '1.000 (Still Hardcoded)',

		[isWithdraw ? 'Minimum Withdraw' : ' Minimum Deposit']: `${minSponsorTokens
			.dividedBy(precision)
			.toString()} CLAW`,
	};

	return {
		...modeSpecificStats,
		'Collateral Ratio - Global': `${globalCollateralizationRatio.dividedBy(precision).toString()}x`,
		'Collateral Ratio - Minimum': `${collateralRequirement.dividedBy(precision).toString()}x`,
		'Collateral Ratio - Current': `4x (Still Hardcoded)`,
		Expiration: `${dayjs(new Date(expirationTimestamp.toNumber() * 1000))
			.utc()
			.format('MMMM DD, YYYY HH:mm')} UTC`,
	};
}
