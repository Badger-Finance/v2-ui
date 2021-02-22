import React, { FC, useState } from 'react';
import { Grid, Box, makeStyles, Button } from '@material-ui/core';
import ClawParams from './ClawParams';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';

interface ClawItem {
	amount: string;
	selectedOption?: string;
	error?: string;
}

const useStyles = makeStyles((theme) => ({
	details: {
		width: '50%',
		marginTop: theme.spacing(2),
		margin: 'auto',
		[theme.breakpoints.only('xs')]: {
			width: '80%',
		},
	},
	button: {
		width: '80%',
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(2),
		margin: 'auto',
		[theme.breakpoints.only('xs')]: {
			width: '100%',
		},
	},
}));

const tokenOptions = ['wBTCwETHSLP', 'bBadger'];

const expiryOptions: Record<string, string[]> = {
	wBTCwETHSLP: ['eCLAW FEB20', 'eCLAW MAR20'],
	bBadger: ['bCLAW FEB20', 'bCLAW FEB20 '],
};

const eCLAWS: Record<string, string> = {
	wBTCwETHSLP: '1000',
	bBadger: '2000',
};

const initialValue: ClawItem = {
	amount: '0.00',
};

export const Mint: FC = () => {
	const classes = useStyles();
	//TODO value should be in store
	const SLPTokenBalance = '0.000017';
	const [collateral, setCollateral] = useState<ClawItem>(initialValue);
	const [mintable, setMintable] = useState<ClawItem>(initialValue);

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
							balance={collateral.selectedOption ? eCLAWS[collateral.selectedOption] : '0'}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<ClawParams
						referenceBalance={collateral.selectedOption ? eCLAWS[collateral.selectedOption] : '0'}
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
						disabled={!!error}
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
