import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultTokenBalance } from '../../../mobx/model/vaults/vault-token-balance';
import { formatWithoutExtraZeros, numberWithCommas } from '../../../mobx/utils/helpers';

const useStyles = makeStyles((theme) => ({
	tokenNameContainer: {
		display: 'flex',
		alignItems: 'center',
	},
	tokenInfo: {
		color: theme.palette.common.black,
		fontWeight: 500,
	},
	tokenIconContainer: {
		width: 20,
		height: 20,
		marginRight: theme.spacing(1),
		border: '2px solid white',
		borderRadius: '50%',
		backgroundColor: 'white',
		overflow: 'hidden',
	},
	icon: {
		width: '100%',
		objectFit: 'contain',
	},
}));

interface Props {
	tokenBalance: VaultTokenBalance;
}

export const TokenDistributionItem = ({ tokenBalance }: Props): JSX.Element => {
	const classes = useStyles();

	const iconName = tokenBalance.symbol.toLowerCase().trim();
	const icon = `/assets/icons/${iconName}.png`;
	const displayAmount = numberWithCommas(formatWithoutExtraZeros(tokenBalance.balance, 2));

	return (
		<Grid container alignItems="center" justifyContent="space-between">
			<div className={classes.tokenNameContainer}>
				<div className={classes.tokenIconContainer}>
					<img src={icon} className={classes.icon} alt="token distribution item" />
				</div>
				<Typography display="inline" variant="body1" className={classes.tokenInfo}>
					{tokenBalance.symbol}
				</Typography>
			</div>
			<Typography display="inline" variant="body1" className={classes.tokenInfo}>
				{displayAmount}
			</Typography>
		</Grid>
	);
};
