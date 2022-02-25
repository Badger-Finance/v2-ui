import React, { useContext } from 'react';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	tokenNameAndIcon: {
		display: 'flex',
		alignItems: 'center',
	},
	tokenName: {
		fontWeight: 400,
		fontSize: 16,
	},
	icon: {
		width: 25,
		marginRight: 15,
	},
	balance: {
		fontWeight: 400,
	},
	tokenBalance: {
		marginBottom: theme.spacing(3),
	},
	balancesList: {
		marginTop: 32,
	},
	balanceDisplayValue: {
		marginTop: theme.spacing(-0.5),
	},
}));

interface Props {
	balance: TokenBalance;
}

const WalletTokenBalance = ({ balance }: Props): JSX.Element => {
	const { uiState } = useContext(StoreContext);
	const classes = useStyles();
	return (
		<Grid container className={classes.tokenBalance}>
			<Grid item container justifyContent="space-between" alignItems="center">
				<div className={classes.tokenNameAndIcon}>
					<img
						className={classes.icon}
						// small hack to allow rem tokens to share icons with their badger counterparts
						src={`/assets/icons/${balance.token.symbol.replace('rem', '').toLowerCase().trim()}.png`}
						alt={`${balance.token.name} icon`}
					/>
					<Typography variant="body1" display="inline" className={classes.tokenName}>
						{balance.token.symbol}
					</Typography>
				</div>
				<Box display="inline">
					<Typography className={classes.balance} variant="body1">
						{balance.balanceDisplay(6)}
					</Typography>
				</Box>
			</Grid>
			<Grid item container justifyContent="flex-end" className={classes.balanceDisplayValue}>
				<Typography className={classes.balance} variant="subtitle2" color="textSecondary">
					{balance.balanceValueDisplay(uiState.currency, 6)}
				</Typography>
			</Grid>
		</Grid>
	);
};

export default observer(WalletTokenBalance);
