import React from 'react';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { StoreContext } from 'mobx/store-context';
import { scaleToString, Direction, BOUNDARY_ERROR } from 'utils/componentHelpers';
import { exchangeRates as ethExchangeRates } from 'mobx/utils/helpers';
import { ClawActionDetail, ClawParam } from '../claw.model';

dayjs.extend(utc);

export function useMaxClaw(collateral: ClawParam, mint: ClawParam): BigNumber | undefined {
	const store = React.useContext(StoreContext);
	const collateralToken = store.contracts.tokens[collateral.selectedOption || ''];
	const synthetic = store.claw.syntheticsDataByEMP.get(mint.selectedOption || '');
	if (!synthetic || !collateral.amount || !collateralToken) return;

	const precision = 10 ** collateralToken.decimals;
	const { globalCollateralizationRatio, cumulativeFeeMultiplier, collateralRequirement } = synthetic;

	// Btw, for using min collateral ratio as initial GCR - we can't actually do that in practice since there's no defined price relationship between collateral < -> synthetic tokens.
	// It's fine for testing but we'll need to remove that logic before release and set the starting GCR by an initial mint(to start the GCR above 1.2x based on current price at launch
	const ratio = globalCollateralizationRatio.isZero() ? collateralRequirement : globalCollateralizationRatio;

	return new BigNumber(collateral.amount)
		.multipliedBy(precision)
		.multipliedBy(cumulativeFeeMultiplier)
		.dividedBy(ratio);
}

// THIS IS ONLY FOR TESTING
// TODO: remove this after testing is done
export function useValidateClaw(mint: ClawParam): boolean {
	const store = React.useContext(StoreContext);
	const synthetic = store.claw.syntheticsDataByEMP.get(mint.selectedOption || '');
	if (!synthetic) return false;
	return synthetic.globalCollateralizationRatio.isZero();
}

export function useDetails(collateral: ClawParam, synthetic: ClawParam): ClawActionDetail[] {
	const store = React.useContext(StoreContext);
	const collateralToken = store.contracts.tokens[collateral.selectedOption || ''];
	const syntheticData = store.claw.syntheticsDataByEMP.get(synthetic.selectedOption || '');
	const collateralPrice = syntheticData && store.setts.getPrice(syntheticData.collateralCurrency);

	if (!syntheticData || !collateralToken || !collateral.amount || !synthetic.amount || !collateralPrice) {
		return [
			{ name: 'Liquidation Price' },
			{ name: 'Collateral Ratio - Global' },
			{ name: 'Collateral Ratio - Minimum' },
			{ name: 'Collateral Ratio - Current' },
			{ name: 'Expiration' },
			{ name: 'Minimum Mint' },
		];
	}

	const {
		globalCollateralizationRatio,
		minSponsorTokens,
		collateralRequirement,
		expirationTimestamp,
	} = syntheticData;

	const decimals = collateralToken.decimals;
	const collateralUsdPrice = collateralPrice.dividedBy(10 ** decimals).multipliedBy(ethExchangeRates.usd);
	const liquidationPrice = new BigNumber(collateral.amount).multipliedBy(collateralUsdPrice); // Collateral Amount * Collateral Price in USD
	const currentCollateralRatio = liquidationPrice.dividedBy(synthetic.amount); // Liquidation Price in USD / Synthetic Amount (because they're assume to cost 1$)

	return [
		{ name: 'Liquidation Price', text: `${liquidationPrice.toFixed(decimals, BigNumber.ROUND_DOWN)} $` },
		{
			name: 'Collateral Ratio - Global',
			text: `${scaleToString(globalCollateralizationRatio, decimals, Direction.Down)} ${collateralToken.name}`,
		},
		{
			name: 'Collateral Ratio - Minimum',
			text: `${scaleToString(collateralRequirement, decimals, Direction.Down)} $`,
		},
		{
			name: 'Collateral Ratio - Current',
			text: currentCollateralRatio.isFinite()
				? `${currentCollateralRatio.toFixed(decimals, BigNumber.ROUND_DOWN)} $`
				: '-',
		},
		{
			name: 'Expiration',
			text: `${dayjs(new Date(expirationTimestamp.toNumber() * 1000))
				.utc()
				.format('MMMM DD, YYYY HH:mm')} UTC`,
		},
		{ name: 'Minimum Mint', text: `${scaleToString(minSponsorTokens, decimals, Direction.Down)} CLAW` },
	];
}

export function useError(collateral: ClawParam, synthetic: ClawParam): string | false {
	const store = React.useContext(StoreContext);
	const collateralToken = store.contracts.tokens[collateral.selectedOption || ''];
	const collateralName = store.claw.collaterals.get(collateralToken?.address || '') || 'Collateral Token';

	const collateralAmountError = collateral.error === BOUNDARY_ERROR.UNDER && `Insufficient ${collateralName}`;
	const collateralBalanceError = collateral.error === BOUNDARY_ERROR.OVER && `Insufficient ${collateralName} balance`;
	const insufficientClawBalance = synthetic.error === BOUNDARY_ERROR.OVER && 'Insufficient CLAW balance';
	const insufficientInputAmount = synthetic.error === BOUNDARY_ERROR.UNDER && 'Insufficient input CLAW amount';
	const syntheticBalanceError = insufficientClawBalance || insufficientInputAmount;
	const noCollateral = !collateral.selectedOption && 'Select a Collateral Token';
	const noCollateralAmount = !collateral.amount && 'Enter collateral amount';
	const noSynthetic = !synthetic.selectedOption && 'Select a Mintable CLAW';
	const noSyntheticAmount = !synthetic.amount && 'Enter amount to mint';

	return (
		collateralAmountError ||
		collateralBalanceError ||
		syntheticBalanceError ||
		noCollateral ||
		noCollateralAmount ||
		noSynthetic ||
		noSyntheticAmount
	);
}
