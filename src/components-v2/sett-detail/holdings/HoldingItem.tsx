import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { formatWithoutExtraZeros, numberWithCommas } from '../../../mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import { BigNumber, BigNumberish } from 'ethers';

const useStyles = makeStyles((theme) => ({
	titleContainer: {
		display: 'flex',
		alignItems: 'center',
	},
	holdingsName: {
		fontSize: 16,
	},
	cardContainer: {
		padding: theme.spacing(3),
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
	balance: number;
	value: number;
	decimals: number;
	helpIcon?: React.ReactNode;
}

const displayUsdBalance = (value: BigNumberish) => `~$${numberWithCommas(formatWithoutExtraZeros(value, 2))}`;

export const HoldingItem = observer(
	({ name, logo, balance, value, decimals, helpIcon }: Props): JSX.Element => {
		const classes = useStyles();

		return (
			<Paper className={classes.cardContainer}>
				<div className={classes.titleContainer}>
					<Typography className={classes.holdingsName}>{name}</Typography>
					{helpIcon}
				</div>
				<Divider />
				<Grid container className={classes.amountsContainer}>
					<Box display="inline-flex" className={classes.amountText}>
						<div className={classes.logoContainer}>
							<img className={classes.logo} src={logo} alt={`${name} holdings`} />
						</div>
						<div>
							<Typography variant="h5">{formatWithoutExtraZeros(balance, decimals)}</Typography>
							<Typography variant="body2" color="textSecondary">
								{displayUsdBalance(value)}
							</Typography>
						</div>
					</Box>
				</Grid>
			</Paper>
		);
	},
);
