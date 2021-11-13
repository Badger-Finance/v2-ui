import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { StoreContext } from '../../mobx/store-context';
import mainnetDeploy from '../../config/deployments/mainnet.json';
import {
	Avatar,
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import BalanceInput from './BalanceInput';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: 680,
	},
	avatar: {
		display: 'inline-block',
		marginRight: theme.spacing(2),
		width: 43,
		height: 43,
	},
	title: {
		padding: theme.spacing(4, 4, 0, 4),
	},
	content: {
		padding: theme.spacing(2, 4, 4, 4),
	},
	closeButton: {
		position: 'absolute',
		right: 8,
		top: 8,
	},
	inputRow: {
		marginBottom: theme.spacing(0.75),
	},
	divider: {
		margin: theme.spacing(3, 0),
	},
	inputsContainer: {
		marginTop: theme.spacing(3),
	},
	depositButton: {
		marginTop: theme.spacing(3),
	},
}));

const DepositDialog = observer(
	(): JSX.Element => {
		const { user, prices, ibBTCStore, setts } = useContext(StoreContext);
		const [balances, setBalances] = useState<TokenBalance[]>([]);
		const classes = useStyles();

		const handleChange = (tokenBalance: BigNumber, index: number) => {
			const balancesCopy = [...balances];
			balancesCopy[index].tokenBalance = tokenBalance;
			setBalances(balancesCopy);
		};

		useEffect(() => {
			// console.log('update');
			const sBTC = user.getTokenBalance(mainnetDeploy.tokens['sBTC']);
			const renBTC = user.getTokenBalance(mainnetDeploy.tokens['renBTC']);
			const wBTC = user.getTokenBalance(mainnetDeploy.tokens['wBTC']);
			const ibbtc = user.getTokenBalance(mainnetDeploy.tokens['ibBTC']);
			setBalances([sBTC, renBTC, wBTC, ibbtc]);
		}, [ibBTCStore, prices, user, user.loadingBalances, setts.initialized]);

		return (
			<Dialog open={true} fullWidth maxWidth="sm" classes={{ paperWidthSm: classes.root }}>
				<DialogTitle className={classes.title}>
					Deposit Tokens
					<IconButton className={classes.closeButton}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent className={classes.content}>
					<Grid container>
						<Grid item xs={12}>
							<Avatar
								className={classes.avatar}
								src="/assets/icons/bcrvibbtc.png"
								alt="ibbtc curve lp vault"
							/>
							<Box display="inline-block">
								<Typography variant="body1">sBTC / renBTC / wBTC / ibBTC LP</Typography>
								<Typography variant="body1">Convex</Typography>
							</Box>
						</Grid>
						<div className={classes.inputsContainer}>
							{balances.map((tokenBalance, index) => (
								<Grid
									item
									xs={12}
									key={`${tokenBalance.token.address}_${index}`}
									className={classes.inputRow}
								>
									<BalanceInput
										tokenBalance={tokenBalance}
										onChange={(change) => handleChange(change, index)}
									/>
								</Grid>
							))}
						</div>
					</Grid>
					<Divider className={classes.divider} variant="fullWidth" />
					<Grid container alignItems="center" justify="space-between">
						<Typography variant="body1">Total Deposit Amount</Typography>
						<Typography variant="body1">0</Typography>
					</Grid>
					<Button className={classes.depositButton} variant="contained" fullWidth color="primary">
						Deposit
					</Button>
				</DialogContent>
			</Dialog>
		);
	},
);

export default DepositDialog;
