import React from 'react';
import { Paper, Typography, makeStyles } from '@material-ui/core';
import { inCurrency } from '../../mobx/utils/helpers';
import Skeleton from '@material-ui/lab/Skeleton';
import BigNumber from 'bignumber.js';
import CurrencyDisplay from './CurrencyDisplay';

export interface CurrencyInfoCardProps {
	title: string;
	value?: BigNumber;
	currency: string;
}

const useStyles = makeStyles((theme) => ({
	infoPaper: {
		padding: theme.spacing(2),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
}));

const CurrencyInfoCard: React.FC<CurrencyInfoCardProps> = (props: CurrencyInfoCardProps) => {
	const classes = useStyles();
	const { title, value, currency } = props;

	const displayValue = inCurrency(value ?? new BigNumber(''), currency);
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
