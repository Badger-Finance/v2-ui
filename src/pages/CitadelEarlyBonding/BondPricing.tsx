import { observer } from 'mobx-react-lite';
import { Typography, Grid, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { inCurrency } from 'mobx/utils/helpers';
import { Currency } from 'config/enums/currency.enum';
import { CitadelBond } from './bonds.config';
import BigNumber from 'bignumber.js';
import { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';

const useStyles = makeStyles((theme) => ({
	metricName: {
		letterSpacing: '0.0025em',
		fontWeight: 'normal',
		fontSize: '14px',
		lineHeight: '20px',
		color: '#C3C3C3',
	},
	value: {
		fontSize: '14px',
		lineHeight: '150%',
		letterSpacing: '0.25px',
	},
	subvalue: {
		fontSize: '12px',
		lineHeight: '150%',
		letterSpacing: '0.25px',
		color: '#C3C3C3',
	},
}));

interface EarlyBondMetricProps {
	metric: string;
	value?: string;
	subvalue?: string;
}

export const EarlyBondMetric = ({ metric, value, subvalue }: EarlyBondMetricProps): JSX.Element => {
	const classes = useStyles();
	return (
		<>
			<Typography variant="caption" className={classes.metricName}>
				{metric}
			</Typography>
			{value ? <Typography variant="body2">{value}</Typography> : <Skeleton width={85} animation="wave" />}
			{subvalue && <Typography className={classes.subvalue}>{subvalue}</Typography>}
		</>
	);
};

interface BondPricingProps {
	bond: CitadelBond;
}

const BondPricing = observer(({ bond }: BondPricingProps): JSX.Element => {
	const { bondStore } = useContext(StoreContext);
	const { tokenPrice, tokenRatio } = bondStore.getBondInfo(bond);
	const { bondToken } = bond;
	const isWholeNumber = tokenRatio % 1 === 0;

	return (
		<Grid container spacing={2}>
			<Grid item xs={6}>
				<EarlyBondMetric
					metric="Price"
					value={tokenPrice ? inCurrency(new BigNumber(tokenPrice), Currency.USD) : undefined}
				/>
			</Grid>
			<Grid item xs={6}>
				<EarlyBondMetric
					metric="Bond Rate"
					value={
						bond && tokenRatio
							? `${tokenRatio.toFixed(isWholeNumber ? 0 : 3)} CTDL / ${bondToken.symbol}`
							: undefined
					}
				/>
			</Grid>
		</Grid>
	);
});

export default BondPricing;
