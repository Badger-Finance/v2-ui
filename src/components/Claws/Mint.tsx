import React, { FC } from 'react';
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
		margin: 'auto',
		[theme.breakpoints.only('xs')]: {
			width: '100%',
		},
	},
}));

export const Mint: FC = () => {
	const classes = useStyles();

	return (
		<Grid container>
			<Box clone pb={4}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<ClawLabel
								nameLabel="Collateral"
								balanceLabel="Available wbtcWethSLP:"
								balance="0.000017"
							/>
						</Grid>
					</Box>
					<Grid item xs={12}>
						<ClawParams
							tokens={[
								{ name: 'wbtcWethSLP', balance: '100' },
								{ name: 'wbtcWethSLP2', balance: '200' },
								{ name: 'wbtcWethSLP3', balance: '300' },
							]}
						/>
					</Grid>
				</Grid>
			</Box>
			<Grid item xs={12}>
				<Box clone pb={1}>
					<Grid item xs={12}>
						<ClawLabel nameLabel="Mintable" balanceLabel="Maximum eCLAW:" balance="1000" />
					</Grid>
				</Box>
				<Grid item xs={12}>
					<ClawParams
						tokens={[
							{ name: 'wbtcWethSLP', balance: '100' },
							{ name: 'wbtcWethSLP2', balance: '200' },
							{ name: 'wbtcWethSLP3', balance: '300' },
						]}
					/>
				</Grid>
			</Grid>
			<Grid item xs={12} justify="center">
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
			<Grid item xs={12} justify="center">
				<Grid container justify="center">
					<Button color="primary" variant="contained" size="large" className={classes.button}>
						MINT
					</Button>
				</Grid>
			</Grid>
		</Grid>
	);
};
