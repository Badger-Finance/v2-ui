import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { SettTokenBalance } from '../../../mobx/model/setts/sett-token-balance';
import { numberWithCommas } from '../../../mobx/utils/helpers';

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
	token: SettTokenBalance;
}

export const SettToken = ({ token }: Props): JSX.Element => {
	const classes = useStyles();

	// TODO: remove all -small images once the icons in the landing page are deprecated
	const iconName = token.symbol.toLowerCase().trim();
	const icon = `/assets/icons/${iconName}.png`;
	const decimalsAmount = token.balance > 1 ? 0 : 4;
	const balanceDisplay = token.balance.toFixed(decimalsAmount);

	return (
		<Grid className={classes.tokenSpec} container justify="space-between">
			<Box display="flex" alignItems="center">
				<div className={classes.tokenImageContainer}>
					<img className={classes.tokenImage} src={icon} alt={`${token.name} icon`} />
				</div>
				<Typography
					display="inline"
					color="textSecondary"
					className={clsx(classes.specName, classes.tokenName)}
				>
					{token.name}
				</Typography>
			</Box>
			<Typography display="inline" variant="subtitle2">
				{numberWithCommas(balanceDisplay)}
			</Typography>
		</Grid>
	);
};
