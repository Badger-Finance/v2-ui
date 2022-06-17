import { makeStyles, Paper, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';
import React from 'react';

import CurrencyDisplay from './CurrencyDisplay';

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
	const displayValue = value ? value.toFixed() : undefined;
	return (
		<Paper elevation={2} className={classes.infoPaper}>
			<Typography variant="subtitle1" color="textPrimary">
				{title}
			</Typography>
			{displayValue ? (
				<CurrencyDisplay displayValue={displayValue} variant="h5" justifyContent="center" />
			) : (
				<Skeleton animation="wave">
					<Typography variant="h5">Placeholder</Typography>
				</Skeleton>
			)}
		</Paper>
	);
});

export default CurrencyInfoCard;
