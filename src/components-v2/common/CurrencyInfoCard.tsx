import React from 'react';
import { Paper, Typography, makeStyles } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import CurrencyDisplay from './CurrencyDisplay';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import { BigNumber } from 'ethers';

export interface CurrencyInfoCardProps {
	title: string;
	value?: BigNumber;
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

const CurrencyInfoCard: React.FC<CurrencyInfoCardProps> = observer((props: CurrencyInfoCardProps) => {
	const classes = useStyles();
	const { title, value } = props;
	const store = useContext(StoreContext);
	const { currency } = store.uiState;
	const displayValue = value ? inCurrency(value, currency) : undefined;
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
});

export default CurrencyInfoCard;
