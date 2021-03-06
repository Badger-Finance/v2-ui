import React, { FC, useMemo, useState, useContext } from 'react';
import { Grid, Box, Button } from '@material-ui/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import ClawParams, { ClawParam } from './ClawParams';
import { useMainStyles } from './index';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';
import BigNumber from 'bignumber.js';
import { ConnectWalletButton } from './ConnectWalletButton';

dayjs.extend(utc);

const defaultDetails = {
	'Collateral Ratio - Global': '-',
	'Collateral Ratio - Minimum': '-',
	'Collateral Ratio - Current': `-`,
	Expiration: '-',
	'Minimum Mint': '-',
};

export const Mint: FC = observer(() => {
	console.time('render mint');
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const { collaterals, eclawsByCollateral, syntheticsDataByEMP } = store;
	const classes = useMainStyles();
	const [collateral, setCollateral] = useState<ClawParam>({});
	const [mintable, setMintable] = useState<ClawParam>({});
	const collateralToken = contracts.tokens[collateral.selectedOption || ''];

	const maxEclaw = useMemo(() => {
		const synthetics = syntheticsDataByEMP.get(mintable.selectedOption || '');
		if (!synthetics || !collateral.amount) return;

		const { globalCollateralizationRatio, cumulativeFeeMultiplier, collateralRequirement } = synthetics;
		const collateralAmount = new BigNumber(collateral.amount);

		// Btw, for using min collateral ratio as initial GCR - we can't actually do that in practice since there's no defined price relationship between collateral < -> synthetic tokens.
		// It's fine for testing but we'll need to remove that logic before release and set the starting GCR by an initial mint(to start the GCR above 1.2x based on current price at launch
		const ratio = globalCollateralizationRatio.isZero() ? collateralRequirement : globalCollateralizationRatio;

		return collateralAmount.multipliedBy(cumulativeFeeMultiplier).dividedBy(ratio);
	}, [collateral.amount, mintable.selectedOption, syntheticsDataByEMP]);

	const mintDetails = useMemo(() => {
		const synthetics = syntheticsDataByEMP.get(mintable.selectedOption || '');
		if (!synthetics || !collateralToken) return defaultDetails;

		const {
			globalCollateralizationRatio,
			minSponsorTokens,
			collateralRequirement,
			expirationTimestamp,
		} = synthetics;
		const precision = 10 ** collateralToken.decimals;

		return {
			'Liquidation Price': '1.000 (Still Hardcoded)',
			'Collateral Ratio - Global': `${globalCollateralizationRatio.dividedBy(precision).toString()}x`,
			'Collateral Ratio - Minimum': `${collateralRequirement.dividedBy(precision).toString()}x`,
			'Collateral Ratio - Current': `4x (Still Hardcoded)`,
			Expiration: `${dayjs(new Date(expirationTimestamp.toNumber() * 1000))
				.utc()
				.format('MMMM DD, YYYY HH:mm')} UTC`,
			'Minimum Mint': `${minSponsorTokens.dividedBy(precision).toString()} eCLAW`,
		};
	}, [mintable.selectedOption, collateralToken]);

	const noCollateral = !collateral.selectedOption && 'Select a Collateral Token';
	const noCollateralAmount = !collateral.amount && 'Enter collateral amount';
	const noMintable = !mintable.selectedOption && 'Select a Mintable eCLAW';
	const noMintableAmount = !mintable.amount && 'Enter amount to mint';

	const error =
		collateral.error || mintable.error || noCollateral || noCollateralAmount || noMintable || noMintableAmount;

	return (
		<Grid container>
			<Box clone pb={4}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<ClawLabel
								name="Collateral"
								balanceLabel={
									collateralToken && `Available ${collaterals.get(collateralToken.address)}`
								}
								balance={collateralToken?.balance
									.dividedBy(10 ** collateralToken.decimals)
									.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN)}
							/>
						</Grid>
					</Box>
					<Grid item xs={12}>
						//TODO: add validation in Minimum Mint
						<ClawParams
							referenceBalance={collateralToken?.balance.dividedBy(10 ** collateralToken.decimals)}
							placeholder="Select Token"
							amount={collateral.amount}
							selectedOption={collateral.selectedOption}
							options={collaterals}
							disabledAmount={!collateral.selectedOption}
							onAmountChange={(amount: string, error?: boolean) => {
								const collateralName = collateralToken
									? collaterals.get(collateralToken.address)
									: 'collateral token';

								setCollateral({
									...collateral,
									amount,
									error: error ? `Amount exceeds ${collateralName} balance` : undefined,
								});
							}}
							onOptionChange={(selectedOption: string) => {
								setMintable({});
								setCollateral({
									...collateral,
									selectedOption,
									amount: undefined,
								});
							}}
							onApplyPercentage={(percentage: number) => {
								if (!collateralToken) return;
								setCollateral({
									...collateral,
									amount: collateralToken?.balance
										.multipliedBy(percentage / 100)
										.dividedBy(10 ** collateralToken.decimals)
										.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN),
								});
							}}
						/>
					</Grid>
				</Grid>
			</Box>
			<Grid item xs={12}>
				<Box clone pb={1}>
					<Grid item xs={12}>
						<ClawLabel
							name="Mintable"
							balanceLabel={maxEclaw && 'Max eCLAW:'}
							balance={
								maxEclaw &&
								`Maximum eCLAW: ${maxEclaw
									.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN)
									.toString()}`
							}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<ClawParams
						referenceBalance={maxEclaw}
						placeholder="Select Expiry"
						amount={mintable.amount}
						selectedOption={mintable.selectedOption}
						disabledOptions={!collateral.selectedOption}
						disabledAmount={!collateral.selectedOption || !mintable.selectedOption}
						onAmountChange={(amount: string, error?: boolean) => {
							setMintable({
								...mintable,
								amount,
								error: error ? 'Amount exceeds eCLAW balance' : undefined,
							});
						}}
						options={
							collateral.selectedOption ? eclawsByCollateral.get(collateral.selectedOption) : new Map()
						}
						onOptionChange={(selectedOption: string) => {
							setMintable({
								...mintable,
								amount: undefined,
								selectedOption,
							});
						}}
						onApplyPercentage={(percentage: number) => {
							if (!maxEclaw || !collateralToken) return;
							setMintable({
								...mintable,
								amount: maxEclaw
									.multipliedBy(percentage / 100)
									.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN),
							});
						}}
					/>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container className={classes.details}>
					<ClawDetails details={mintDetails} />
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container>
					{!wallet.connectedAddress ? (
						<ConnectWalletButton />
					) : (
						<Button
							color="primary"
							variant="contained"
							disabled={!!error || !collateral.selectedOption || !mintable.selectedOption}
							size="large"
							className={classes.button}
						>
							{error ? error : 'MINT'}
						</Button>
					)}
				</Grid>
			</Grid>
		</Grid>
	);
});

export default Mint;
