import React from 'react';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { StoreContext } from 'mobx/store-context';
import { scaleToString, Direction } from 'utils/componentHelpers';
import { ClawParam, INVALID_REASON } from '..';

dayjs.extend(utc);

export function useMaxClaw(collateral: ClawParam, mint: ClawParam) {
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
export function useValidateClaw(mint: ClawParam) {
	const store = React.useContext(StoreContext);
	const synthetic = store.claw.syntheticsDataByEMP.get(mint.selectedOption || '');
	if (!synthetic) return false;
	return synthetic.globalCollateralizationRatio.isZero();
}

export function useMintDetails(collateral: ClawParam, mint: ClawParam) {
	const store = React.useContext(StoreContext);
	const collateralToken = store.contracts.tokens[collateral.selectedOption || ''];
	const synthetics = store.claw.syntheticsDataByEMP.get(mint.selectedOption || '');
	const price = synthetics && store.setts.getPrice(synthetics.collateralCurrency);

	if (!synthetics || !collateralToken || !collateral.amount || !mint.amount || !price) {
		return {
			'Liquidation Price': undefined,
			'Collateral Ratio - Global': undefined,
			'Collateral Ratio - Minimum': undefined,
			'Collateral Ratio - Current': undefined,
			Expiration: undefined,
			'Minimum Mint': undefined,
		};
	}

	const { globalCollateralizationRatio, minSponsorTokens, collateralRequirement, expirationTimestamp } = synthetics;

	const precision = collateralToken.decimals;
	const liquidationPrice = new BigNumber(collateral.amount).multipliedBy(price);
	const currentCollateralRatio = liquidationPrice.dividedBy(mint.amount);

	return {
		'Liquidation Price': scaleToString(liquidationPrice, precision, Direction.Down),
		'Collateral Ratio - Global': `${scaleToString(globalCollateralizationRatio, precision, Direction.Down)}x`,
		'Collateral Ratio - Minimum': `${scaleToString(collateralRequirement, precision, Direction.Down)}x`,
		'Collateral Ratio - Current': `${currentCollateralRatio.toString()}x`,
		Expiration: `${dayjs(new Date(expirationTimestamp.toNumber() * 1000))
			.utc()
			.format('MMMM DD, YYYY HH:mm')} UTC`,
		'Minimum Mint': `${scaleToString(minSponsorTokens, precision, Direction.Down)} CLAW`,
	};
}

export function useError(collateral: ClawParam, synthetic: ClawParam) {
	const store = React.useContext(StoreContext);
	const collateralToken = store.contracts.tokens[collateral.selectedOption || ''];
	const collateralName = store.claw.collaterals.get(collateralToken?.address || '') || 'Collateral Token';

	const collateralBalanceError =
		collateral.error === INVALID_REASON.OVER_MAXIMUM && `Insufficient ${collateralName} balance`;
	const mintableBalanceError =
		synthetic.error &&
		(synthetic.error === INVALID_REASON.OVER_MAXIMUM ? 'Insufficient CLAW balance' : 'Insufficient CLAW amount');
	const noCollateral = !collateral.selectedOption && 'Select a Collateral Token';
	const noCollateralAmount = !collateral.amount && 'Enter collateral amount';
	const noMintable = !synthetic.selectedOption && 'Select a Mintable CLAW';
	const noMintableAmount = !synthetic.amount && 'Enter amount to mint';

	return (
		collateralBalanceError ||
		mintableBalanceError ||
		noCollateral ||
		noCollateralAmount ||
		noMintable ||
		noMintableAmount
	);
}
