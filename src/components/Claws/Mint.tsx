import React, { FC, useState } from 'react';
import { Grid, Box, Button } from '@material-ui/core';
import ClawParams, { ClawParam } from './ClawParams';
import { useMainStyles } from './index';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';

const tokenOptions = ['wBTCwETHSLP', 'bBadger'];

const expiryOptions: Record<string, string[]> = {
	wBTCwETHSLP: ['eCLAW FEB20', 'eCLAW MAR20'],
	bBadger: ['bCLAW FEB20', 'bCLAW FEB20'],
};

const eCLAWS: Record<string, string> = {
	wBTCwETHSLP: '1000',
	bBadger: '2000',
};

const initialValue: ClawParam = {
	amount: '0.00',
};

export const Mint: FC = () => {
	const classes = useMainStyles();
	//TODO value should be in store
	const SLPTokenBalance = '0.000017';
	const [collateral, setCollateral] = useState<ClawParam>(initialValue);
	const [mintable, setMintable] = useState<ClawParam>(initialValue);

	const error = collateral.error || mintable.error;

	return (
		<Grid container>
			<Box clone pb={4}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<ClawLabel
								name="Collateral"
								balanceLabel="Available wbtcWethSLP:"
								balance={SLPTokenBalance}
							/>
						</Grid>
					</Box>
					<Grid item xs={12}>
						<ClawParams
							referenceBalance={SLPTokenBalance}
							placeholder="Select Token"
							amount={collateral.amount}
							onAmountChange={(amount: string, error?: boolean) => {
								setCollateral({
									...collateral,
									amount,
									error: error ? 'Amount exceeds wbtcWethSLP balance' : undefined,
								});
							}}
							selectedOption={collateral.selectedOption}
							onOptionChange={(selectedOption: string) => {
								setMintable(initialValue);
								setCollateral({
									...collateral,
									selectedOption,
								});
							}}
							options={tokenOptions}
							disabledAmount={!collateral.selectedOption}
						/>
					</Grid>
				</Grid>
			</Box>
			<Grid item xs={12}>
				<Box clone pb={1}>
					<Grid item xs={12}>
						<ClawLabel
							name="Mintable"
							balanceLabel="Maximum eCLAW:"
							balance={collateral.selectedOption && eCLAWS[collateral.selectedOption]}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<ClawParams
						referenceBalance={collateral.selectedOption && eCLAWS[collateral.selectedOption]}
						placeholder="Select Expiry"
						amount={mintable.amount}
						onAmountChange={(amount: string, error?: boolean) => {
							setMintable({
								...mintable,
								amount,
								error: error ? 'Amount exceeds eCLAW balance' : undefined,
							});
						}}
						selectedOption={mintable.selectedOption}
						options={collateral.selectedOption ? expiryOptions[collateral.selectedOption] : []}
						onOptionChange={(selectedOption: string) => {
							setMintable({
								...mintable,
								selectedOption,
							});
						}}
						disabledAmount={!collateral.selectedOption}
						disabledOptions={!collateral.selectedOption}
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
};

export default Mint;
