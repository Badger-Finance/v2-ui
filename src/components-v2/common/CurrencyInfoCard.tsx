import React from 'react';
import { Paper, Typography, makeStyles, Grid } from '@material-ui/core';
import { formatPrice } from 'mobx/reducers/statsReducers';
import { usdToCurrency } from '../../mobx/utils/helpers';
import Skeleton from '@material-ui/lab/Skeleton';
import BigNumber from 'bignumber.js';
import CurrencyDisplay from './CurrencyDisplay';

export interface CurrencyInfoCardProps {
	title: string;
	value: BigNumber | undefined;
	currency: string;
	isUsd?: boolean;
}

const useStyles = makeStyles((theme) => ({
	infoPaper: {
		padding: theme.spacing(2),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	bnbIcon: {
		marginRight: theme.spacing(1),
		width: 20,
		height: 20
	},
	valueContainer: {
		justifyContent: 'center',
		alignItems: 'center'
	},
}));


const CurrencyInfoCard: React.FC<CurrencyInfoCardProps> = (props: CurrencyInfoCardProps) => {
	const classes = useStyles();
	const { title, value, currency, isUsd = false } = props;

	// todo: convert all usd native values to eth in store!
	let displayValue: string | undefined;
	if (value) {
		displayValue = isUsd ? usdToCurrency(value, currency) : formatPrice(value, currency);
	}
	return (
		<Paper elevation={2} className={classes.infoPaper}>
			<Typography variant="subtitle1" color="textPrimary">
				{title}
			</Typography>
			{displayValue ? (
				<CurrencyDisplay displayValue={displayValue} variant="h5" justify="center" />
			) : (
				<Skeleton animation="wave">
					<Typography variant="h5">Placeholder</Typography>
				</Skeleton>
			)}
		</Paper>
	);
};

export default CurrencyInfoCard;
