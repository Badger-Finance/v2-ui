import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SettTokenBalance } from '../../../mobx/model/setts/sett-token-balance';
import { formatWithoutExtraZeros, numberWithCommas } from '../../../mobx/utils/helpers';

const useStyles = makeStyles((theme) => ({
	tokenNameContainer: {
		display: 'flex',
		alignItems: 'center',
	},
	tokenInfo: {
		color: theme.palette.common.black,
		fontWeight: 400,
	},
	tokenIconContainer: {
		width: 18,
		height: 18,
		marginRight: theme.spacing(1),
		border: '1px solid white',
		borderRadius: '100%',
		backgroundColor: 'white',
		overflow: 'hidden',
	},
	icon: {
		width: '100%',
		objectFit: 'contain',
	},
}));

interface Props {
	tokenBalance: SettTokenBalance;
}

export const TokenDistributionItem = ({ tokenBalance }: Props): JSX.Element => {
	const classes = useStyles();

	const iconName = tokenBalance.symbol.toLowerCase().trim();
	const icon = `/assets/icons/${iconName}.png`;
	const decimalsAmount = tokenBalance.decimals || 18;

	return (
		<Grid container alignItems="center" justify="space-between">
			<div className={classes.tokenNameContainer}>
				<div className={classes.tokenIconContainer}>
					<img src={icon} className={classes.icon} alt="token distribution item" />
				</div>
				<Typography display="inline" variant="body1" className={classes.tokenInfo}>
					{tokenBalance.symbol}
				</Typography>
			</div>
			<Typography display="inline" variant="body1" className={classes.tokenInfo}>
				{numberWithCommas(formatWithoutExtraZeros(tokenBalance.balance, decimalsAmount))}
			</Typography>
		</Grid>
	);
};
