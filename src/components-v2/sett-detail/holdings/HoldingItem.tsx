import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid, Paper, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatWithoutExtraZeros, numberWithCommas } from '../../../mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
	titleContainer: {
		display: 'flex',
		alignItems: 'center',
	},
	holdingsName: {
		fontSize: 16,
	},
	cardContainer: {
		padding: theme.spacing(2),
	},
	logoContainer: {
		display: 'inline-flex',
		width: 48,
		height: 48,
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
		marginTop: theme.spacing(1),
	},
}));

interface Props {
	name: string;
	logo: string;
	amount: BigNumber.Value;
	decimals: number;
	helpIcon?: React.ReactNode;
}

const displayUsdBalance = (value: BigNumber.Value) => `~${numberWithCommas(formatWithoutExtraZeros(value, 4))}$`;

export const HoldingItem = observer(
	({ name, logo, amount, decimals, helpIcon }: Props): JSX.Element => {
		const { prices } = React.useContext(StoreContext);
		const classes = useStyles();

		const usdExchangeRate = prices.exchangeRates?.usd;
		const displayAmount = usdExchangeRate ? new BigNumber(amount).multipliedBy(usdExchangeRate) : undefined;

		return (
			<Paper className={classes.cardContainer}>
				<div className={classes.titleContainer}>
					<Typography className={classes.holdingsName}>{name}</Typography>
					{helpIcon}
				</div>
				<Grid container className={classes.amountsContainer}>
					<Box display="inline-flex" className={classes.amountText}>
						<div className={classes.logoContainer}>
							<img className={classes.logo} src={logo} alt={`${name} holdings`} />
						</div>
						<div>
							<Typography variant="h5">{formatWithoutExtraZeros(amount, decimals)}</Typography>
							<Typography variant="body2" color="textSecondary">
								{displayAmount ? displayUsdBalance(displayAmount) : <Skeleton width={30} />}
							</Typography>
						</div>
					</Box>
				</Grid>
			</Paper>
		);
	},
);
