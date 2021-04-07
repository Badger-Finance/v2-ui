import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StoreContext } from 'mobx/store-context';
import { scaleToString, Direction, BOUNDARY_ERROR } from 'utils/componentHelpers';
import BigNumber from 'bignumber.js';
import { exchangeRates as ethExchangeRates } from 'mobx/utils/helpers';
import { ClawParam } from '../claw-param.model';

dayjs.extend(utc);
dayjs.extend(relativeTime);

const defaultWithdrawalDetails = [
	{ name: 'Withdraw Speed' },
	{ name: 'Collateral Ratio - Global' },
	{ name: 'Collateral Ratio - Minimum' },
	{ name: 'Collateral Ratio - Current' },
	{ name: 'Expiration' },
	{ name: 'Minimum Withdraw' },
];

const defaultDepositDetails = [
	{ name: 'Liquidation Price' },
	{ name: 'Collateral Ratio - Global' },
	{ name: 'Collateral Ratio - Minimum' },
	{ name: 'Collateral Ratio - Current' },
	{ name: 'Expiration' },
	{ name: 'Minimum Deposit' },
];

export function useError({ selectedOption, amount, error }: ClawParam): string {
	const { claw, contracts } = React.useContext(StoreContext);
	const selectedSynthetic = claw.syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency ?? ''];

	const collateralName = bToken ? claw.collaterals.get(bToken.address) : 'collateral token';
	const errors: string[] = [];
	if (!selectedOption) errors.push('Select a Token');
	if (!amount) errors.push('Enter an amount');
	if (error === BOUNDARY_ERROR.OVER) errors.push(`Amount exceeds ${collateralName} balance`);

	if (errors.length === 0) return '';

	return errors.reduce((a, b) => a || b);
}

export function useDetails(mode: string, manage: ClawParam) {
	const { claw, contracts, setts } = React.useContext(StoreContext);
	const isWithdraw = mode === 'withdraw';
	const syntheticData = claw.syntheticsDataByEMP.get(manage.selectedOption || '');
	const sponsorData = claw.sponsorInformationByEMP.get(manage.selectedOption || '');
	const price = syntheticData && setts.getPrice(syntheticData.collateralCurrency);
	const bToken = contracts.tokens[syntheticData?.collateralCurrency ?? ''];
	const collateralPrice = syntheticData && setts.getPrice(syntheticData.collateralCurrency);

	if (!syntheticData || !bToken || !price || !manage.amount || !collateralPrice || !sponsorData) {
		return isWithdraw ? defaultWithdrawalDetails : defaultDepositDetails;
	}

	const {
		globalCollateralizationRatio,
		minSponsorTokens,
		collateralRequirement,
		expirationTimestamp,
	} = syntheticData;

	const decimals = bToken.decimals || 18;
	const collateralUsdPrice = collateralPrice.dividedBy(10 ** decimals).multipliedBy(ethExchangeRates.usd);
	const liquidationPrice = new BigNumber(manage.amount).multipliedBy(collateralUsdPrice);
	const currentCollateralRatio = liquidationPrice.dividedBy(manage.amount);
	const withdrawalRequestPassTimestamp = sponsorData.position.withdrawalRequestPassTimestamp.toNumber() * 1000;
	const withdrawTime = dayjs().isBefore(withdrawalRequestPassTimestamp)
		? dayjs().to(withdrawalRequestPassTimestamp, true)
		: undefined;

	const modeSpecificStats = [
		{
			name: isWithdraw ? 'Withdraw Speed' : 'Liquidation Price',
			text: isWithdraw ? 'Slow' : liquidationPrice.toFixed(decimals, BigNumber.ROUND_DOWN),
			subText: isWithdraw ? withdrawTime : undefined,
		},

		{
			name: isWithdraw ? 'Minimum Withdraw' : ' Minimum Deposit',
			text: `${scaleToString(minSponsorTokens, decimals, Direction.Down)} CLAW`,
		},
	];

	return [
		...modeSpecificStats,
		{
			name: 'Collateral Ratio - Global',
			text: `${scaleToString(globalCollateralizationRatio, decimals, Direction.Down)}x`,
		},
		{
			name: 'Collateral Ratio - Minimum',
			text: `${scaleToString(collateralRequirement, decimals, Direction.Down)}x`,
		},
		{ name: 'Collateral Ratio - Current', text: `${currentCollateralRatio.toString()}x` },
		{
			name: 'Expiration',
			text: `${dayjs(new Date(expirationTimestamp.toNumber() * 1000))
				.utc()
				.format('MMMM DD, YYYY HH:mm')} UTC`,
		},
	];
}
