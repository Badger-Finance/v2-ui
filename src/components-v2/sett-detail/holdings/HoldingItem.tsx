import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Divider, Grid, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatWithoutExtraZeros, numberWithCommas } from '../../../mobx/utils/helpers';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	titleContainer: {
		// display: 'flex',
		// alignItems: 'center',
		wordBreak: 'break-all',
	},
	holdingsName: {
		fontSize: 16,
	},
	amount: {
		fontSize: 20,
		fontWeight: 500,
	},
	cardContainer: {
		padding: theme.spacing(2),
	},
	logoContainer: {
		display: 'inline-flex',
		width: 40,
		height: 40,
		marginRight: theme.spacing(1),
	},
	logo: {
		width: '100%',
		margin: 'auto',
	},
	amountsContainer: {
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	amountText: {
		alignItems: 'center',
	},
	divider: {
		width: '100%',
		marginBottom: theme.spacing(1),
	},
}));

interface Props {
	name: string;
	logo: string;
	balance: BigNumber.Value;
	value: BigNumber.Value;
	decimals: number;
}

const displayUsdBalance = (value: BigNumber.Value) => `~$${numberWithCommas(formatWithoutExtraZeros(value, 2))}`;

export const HoldingItem = observer(
	({ name, logo, balance, value, decimals }: Props): JSX.Element => {
		const classes = useStyles();

		return (
			<Grid container>
				<Grid container className={classes.titleContainer}>
					<Typography className={classes.holdingsName}>{name}</Typography>
				</Grid>
				<Divider className={classes.divider} />
				<Grid container className={classes.amountsContainer}>
					<Box display="inline-flex" className={classes.amountText}>
						<div className={classes.logoContainer}>
							<img className={classes.logo} src={logo} alt={`${name} holdings`} />
						</div>
						<div>
							<Typography className={classes.amount}>
								{formatWithoutExtraZeros(balance, decimals)}
							</Typography>
							<Typography variant="body2" color="textSecondary">
								{displayUsdBalance(value)}
							</Typography>
						</div>
					</Box>
				</Grid>
			</Grid>
		);
	},
);
