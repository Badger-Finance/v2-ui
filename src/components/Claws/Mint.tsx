import React, { FC, useMemo, useState } from 'react';
import { Grid, Box, Button } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import ClawParams, { ClawParam } from './ClawParams';
import { useMainStyles } from './index';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';
import BigNumber from 'bignumber.js';

export const Mint: FC = observer(() => {
	const classes = useMainStyles();
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const [collateral, setCollateral] = useState<ClawParam>({});
	const [mintable, setMintable] = useState<ClawParam>({});
	const { collaterals, eclawsByCollateral, syntheticsDataByEMP } = store;
	const { tokens } = contracts;

	const collateralToken = collateral.selectedOption && tokens[collateral.selectedOption];

	const maxEclaw = useMemo(() => {
		const synthetics = mintable.selectedOption && syntheticsDataByEMP.get(mintable.selectedOption);
		if (!synthetics || !collateral.amount) return;

		const { globalCollateralizationRatio, cumulativeFeeMultiplier } = synthetics;
		const collateralAmount = new BigNumber(collateral.amount);
		const minCollateralAmount = globalCollateralizationRatio
			.multipliedBy(collateralAmount)
			.dividedBy(cumulativeFeeMultiplier);
		return minCollateralAmount.multipliedBy(cumulativeFeeMultiplier).dividedBy(globalCollateralizationRatio);
	}, [collateral.amount, mintable.selectedOption, syntheticsDataByEMP]);

	console.log({ maxEclaw });

	const walletNotConnected = (!tokens || !wallet.connectedAddress) && 'Connect Wallet';
	const error = walletNotConnected || collateral.error || mintable.error;

	return (
		<Grid container>
			<Box clone pb={4}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<ClawLabel
								name="Collateral"
								balanceLabel={
									collateral.selectedOption &&
									`Available ${collaterals.get(collateral.selectedOption)}`
								}
								balance={collateralToken?.balance.dividedBy(10 ** 18).toFixed(18, BigNumber.ROUND_DOWN)}
							/>
						</Grid>
					</Box>
					<Grid item xs={12}>
						<ClawParams
							referenceBalance={collateralToken?.balance.dividedBy(10 ** 18)}
							placeholder="Select Token"
							amount={collateral.amount}
							selectedOption={collateral.selectedOption}
							options={collaterals}
							disabledAmount={!collateral.selectedOption}
							onAmountChange={(amount: string, error?: boolean) => {
								const collateralName = collateral.selectedOption
									? collaterals.get(collateral.selectedOption)
									: 'collateral';
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
								});
							}}
							onApplyPercentage={(percentage: number) => {
								setCollateral({
									...collateral,
									amount: collateralToken?.balance
										.multipliedBy(percentage / 100)
										.dividedBy(10 ** 18)
										.toFixed(18, BigNumber.ROUND_DOWN),
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
							balance={maxEclaw && `Maximum eCLAW: ${maxEclaw.toString()}`}
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
								selectedOption,
							});
						}}
						onApplyPercentage={() => {}}
					/>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container className={classes.details}>
					<ClawDetails
						details={[
							{ 'Liquidation Price': '1.000' },
							{ 'Collateral Ratio - Global': '1.2x' },
							{ 'Collateral Ratio - Minimum': '1.2x' },
							{ 'Collateral Ratio - Current': '4x' },
							{ 'Expiration 4x': 'Feb 29th, 2021' },
							{ 'Minimum Mint': '100 eCLAW' },
						]}
					/>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container>
					<Button
						color="primary"
						variant="contained"
						disabled={!!error || !collateral.selectedOption || !mintable.selectedOption}
						size="large"
						className={classes.button}
					>
						{error ? error : 'MINT'}
					</Button>
				</Grid>
			</Grid>
		</Grid>
	);
});

export default Mint;
