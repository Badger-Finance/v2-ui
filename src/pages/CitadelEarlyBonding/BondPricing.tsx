import { observer } from 'mobx-react-lite';
import { Typography, Grid, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import { Currency } from 'config/enums/currency.enum';
import { CitadelBond } from './bonds.config';
import BigNumber from 'bignumber.js';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';

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
			{value ? <Typography variant="caption">{value}</Typography> : <Skeleton width={85} animation="wave" />}
		</>
	);
};

interface BondPricingProps {
	bond?: CitadelBond;
}

const BondPricing = observer(({ bond }: BondPricingProps): JSX.Element => {
	const store = useContext(StoreContext);

	const [tokenPrice, setTokenPrice] = useState<BigNumber | null>(null);
	const [tokenRatio, setTokenRatio] = useState<string | null>(null);

	useEffect(() => {
		if (bond && bond.price) {
			const bondedToken = store.vaults.getToken(bond.address);
			// TODO: Update to bondedToken.decimals
			const tokenRatio = new BigNumber(10 ** 8).dividedBy(bond.price.toString());
			setTokenRatio(tokenRatio.toString());
			const bondedTokenPrice = store.prices.getPrice(ETH_DEPLOY.tokens.wBTC);
			setTokenPrice(bondedTokenPrice.dividedBy(tokenRatio));
		}
	}, [bond]);

	return (
		<Grid container spacing={2}>
			<Grid item xs={6}>
				<EarlyBondMetric metric="Price" value={tokenPrice ? inCurrency(tokenPrice, Currency.USD) : undefined} />
			</Grid>
			<Grid item xs={6}>
				<EarlyBondMetric
					metric="Bond Rate"
					value={bond && tokenRatio ? `${tokenRatio} CTDL / ${bond.token}` : undefined}
				/>
			</Grid>
		</Grid>
	);
});

export default BondPricing;
