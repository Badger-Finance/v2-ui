import { observer } from 'mobx-react-lite';
import { Typography, Grid, makeStyles, Card, Paper, Button } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from 'mobx/store-context';
import BigNumber from 'bignumber.js';
import { inCurrency } from 'mobx/utils/helpers';
import { Currency } from 'config/enums/currency.enum';

const useStyles = makeStyles((theme) => ({
	cardSplash: {
		width: '100%',
	},
	bondContent: {
		padding: '21px',
	},
	bondIcon: {
		marginRight: theme.spacing(2),
	},
	bondTitle: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: theme.spacing(3),
		cursor: 'default',
	},
	metricName: {
		textTransform: 'uppercase',
		letterSpacing: '0.0025em',
		fontWeight: 'normal',
		fontSize: '14px',
		lineHeight: '20px',
		color: '#C3C3C3',
	},
	bondInfo: {
		marginBottom: theme.spacing(3),
	},
	bondLink: {
		paddingTop: theme.spacing(3),
	},
	bondStatus: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		flexGrow: 1,
		textTransform: 'uppercase',
	},
	bondStatusIcon: {
		paddingLeft: theme.spacing(0.75),
		paddingRight: theme.spacing(0.75),
		paddingTop: theme.spacing(0.25),
		paddingBottom: theme.spacing(0.25),
		borderRadius: '40px',
		minWidth: '65px',
		display: 'flex',
		justifyContent: 'center',
		lineHeight: '25px',
		fontSize: '12px',
		letterSpacing: '0.25px',
		fontWeight: 'bold',
	},
	pending: {
		backgroundColor: '#FF7C33',
	},
	opened: {
		backgroundColor: '#66BB6A',
	},
	closed: {
		backgroundColor: '#F44336',
	},
	bondButton: {
		width: '100%',
	},
}));

interface EarlyBondMetricProps {
	metric: string;
	value?: string;
}

const EarlyBondMetric = ({ metric, value }: EarlyBondMetricProps): JSX.Element => {
	const classes = useStyles();
	return (
		<>
			<Typography variant="body2" className={classes.metricName}>
				{metric}
			</Typography>
			{value ? <Typography variant="caption">{value}</Typography> : <Skeleton width={35} />}
		</>
	);
};

interface BondPricingProps {
  token: string;
  tokenAddress: string;
  bondAddress?: string;
}

const BondPricing = observer(({ token, tokenAddress }: BondPricingProps): JSX.Element => {
	const classes = useStyles();
  const store = useContext(StoreContext);

  const tokenPrice = store.prices.getPrice(tokenAddress);

  return (
    <Grid container spacing={2} className={classes.bondInfo}>
      <Grid item xs={6}>
        <EarlyBondMetric metric="Price" value={tokenPrice ? inCurrency(tokenPrice, Currency.USD) : undefined} />
      </Grid>
      <Grid item xs={6}>
        <EarlyBondMetric metric="Bond Rate" value={`${10} CTDL / ${token}`} />
      </Grid>
    </Grid>
  );
});

export default BondPricing;
