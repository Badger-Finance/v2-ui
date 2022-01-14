import { observer } from 'mobx-react-lite';
import { Typography, Grid, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import { Currency } from 'config/enums/currency.enum';

const useStyles = makeStyles((theme) => ({
	metricName: {
		textTransform: 'uppercase',
		letterSpacing: '0.0025em',
		fontWeight: 'normal',
		fontSize: '14px',
		lineHeight: '20px',
		color: '#C3C3C3',
	},
}));

interface EarlyBondMetricProps {
	metric: string;
	value?: string;
}

export const EarlyBondMetric = ({ metric, value }: EarlyBondMetricProps): JSX.Element => {
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
		<Grid container spacing={2}>
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
