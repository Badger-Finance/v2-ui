import { Currency } from '@badger-dao/sdk';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import TokenLogo from '../../components-v2/TokenLogo';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';

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
	const classes = useStyles();
	// small hack to allow rem tokens to share icons with their badger counterparts
	const token = { ...balance.token };
	token.symbol = balance.token.symbol.replace('rem', '');
	return (
		<Grid container className={classes.tokenBalance}>
			<Grid item container justifyContent="space-between" alignItems="center">
				<div className={classes.tokenNameAndIcon}>
					<TokenLogo className={classes.icon} token={token} />
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
					{balance.balanceValueDisplay(6)}
				</Typography>
			</Grid>
		</Grid>
	);
};

export default observer(WalletTokenBalance);
