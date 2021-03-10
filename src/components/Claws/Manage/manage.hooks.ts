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

export function useError({ selectedOption, amount, error }: ClawParam) {
	const { claw, contracts } = React.useContext(StoreContext);
	const selectedSynthetic = claw.syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];

	const collateralName = bToken ? claw.collaterals.get(bToken.address) : 'collateral token';
	const noTokenError = !selectedOption && 'Select a Token';
	const amountError = !amount && 'Enter an amount';
	const balanceError = error === INVALID_REASON.OVER_MAXIMUM && `Amount exceeds ${collateralName} balance`;

	return noTokenError || amountError || balanceError;
}

export function useDetails(mode: string, manage: ClawParam) {
	const { claw, contracts } = React.useContext(StoreContext);
	const isWithdraw = mode === 'withdraw';
	const synthetic = claw.syntheticsDataByEMP.get(manage.selectedOption || '');
	const bToken = contracts.tokens[synthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];

	if (!synthetic || !bToken) return isWithdraw ? defaultWithdrawalDetails : defaultDepositDetails;

	const { globalCollateralizationRatio, minSponsorTokens, collateralRequirement, expirationTimestamp } = synthetic;
	const precision = 10 ** bToken.decimals;

	const modeSpecificStats = {
		[isWithdraw ? 'Withdraw Speed' : 'Liquidation Price']: isWithdraw
			? 'Instant (Still Hardcoded)'
			: '1.000 (Still Hardcoded)',

		[isWithdraw ? 'Minimum Withdraw' : ' Minimum Deposit']: `${minSponsorTokens
			.dividedBy(precision)
			.toString()} eCLAW`,
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
