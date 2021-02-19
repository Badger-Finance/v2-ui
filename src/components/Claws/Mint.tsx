import React, { FC, useState } from 'react';
import { Grid, Box, makeStyles, Button } from '@material-ui/core';
import ClawParams from './ClawParams';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';

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

export const Mint: FC = () => {
	const classes = useStyles();
	//TODO value should be in store
	const SLPTokenBalance = '0.000017';
	const [collateralToken, setCollateralToken] = useState<string | undefined>(undefined);
	const [expiry, setExpiry] = useState<string | undefined>(undefined);
	const [collateralAmount, setCollateralAmount] = useState('0.00');
	const [expiryAmount, setExpiryAmount] = useState('0.00');

	const handleTokenChange = (token: string) => {
		setExpiry(undefined);
		setExpiryAmount('0.00');
		setCollateralToken(token);
	};

	return (
		<Grid container>
			<Box clone pb={4}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<ClawLabel
								firstLabel="Collateral"
								secondLabel="Available wbtcWethSLP:"
								thirdLabel={SLPTokenBalance}
							/>
						</Grid>
					</Box>
					<Grid item xs={12}>
						<ClawParams
							referenceBalance={SLPTokenBalance}
							placeholder="Select Token"
							amount={collateralAmount}
							onAmountChange={setCollateralAmount}
							selectedOption={collateralToken}
							onOptionChange={handleTokenChange}
							options={tokenOptions}
							disabledAmount={!collateralToken}
						/>
					</Grid>
				</Grid>
			</Box>
			<Grid item xs={12}>
				<Box clone pb={1}>
					<Grid item xs={12}>
						<ClawLabel
							firstLabel="Mintable"
							secondLabel="Maximum eCLAW:"
							thirdLabel={collateralToken ? eCLAWS[collateralToken] : '0'}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<ClawParams
						referenceBalance={collateralToken ? eCLAWS[collateralToken] : '0'}
						placeholder="Select Expiry"
						amount={expiryAmount}
						onAmountChange={setExpiryAmount}
						selectedOption={expiry}
						options={collateralToken ? expiryOptions[collateralToken] : []}
						onOptionChange={setExpiry}
						disabledAmount={!collateralToken}
						disabledOptions={!collateralToken}
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
					<Button color="primary" variant="contained" size="large" className={classes.button}>
						MINT
					</Button>
				</Grid>
			</Grid>
		</Grid>
	);
};
