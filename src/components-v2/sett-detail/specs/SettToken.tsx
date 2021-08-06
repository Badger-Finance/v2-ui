import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import clsx from 'clsx';

import { numberWithCommas } from '../../../mobx/utils/helpers';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: 20,
	},
	specName: {
		fontSize: 12,
		lineHeight: '1.66',
	},
	tokenSpec: {
		marginBottom: theme.spacing(1),
	},
	tokenName: {
		marginLeft: theme.spacing(1),
	},
	tokenImageContainer: {
		width: 16,
		height: 16,
		display: 'inline',
		alignItems: 'center',
	},
	tokenImage: {
		width: '100%',
	},
}));

interface Props {
	name: string;
	balance: number;
	iconName: string;
	decimalsAmount: number;
}

export const SettToken = ({ name, balance, iconName, decimalsAmount }: Props): JSX.Element => {
	const classes = useStyles();

	const icon = `/assets/icons/${iconName.toLowerCase()}.png`;
	const balanceDisplay = balance.toFixed(decimalsAmount);

	return (
		<Grid className={classes.tokenSpec} container justify="space-between">
			<Box display="flex" alignItems="center">
				<div className={classes.tokenImageContainer}>
					<img className={classes.tokenImage} src={icon} alt={`${name} icon`} />
				</div>
				<Typography
					display="inline"
					color="textSecondary"
					className={clsx(classes.specName, classes.tokenName)}
				>
					{name}
				</Typography>
			</Box>
			<Typography display="inline" variant="subtitle2">
				{numberWithCommas(balanceDisplay)}
			</Typography>
		</Grid>
	);
};
