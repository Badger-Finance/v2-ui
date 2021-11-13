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
	Tab,
	Tabs,
	Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import BalanceInput from './BalanceInput';
import BigNumber from 'bignumber.js';
import { inCurrency } from '../../mobx/utils/helpers';
import { Currency } from '../../config/enums/currency.enum';
import { ETH_DEPLOY } from '../../mobx/model/network/eth.network';
import { BalanceNamespace } from '../../web3/config/namespaces';

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: 680,
	},
	tab: {
		paddingLeft: 0,
		textTransform: 'capitalize',
	},
	tabs: {
		marginTop: theme.spacing(2),
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
		marginTop: theme.spacing(2),
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

enum DepositType {
	token = 'token',
	lpToken = 'lp-token',
}

interface Props {
	show?: boolean;
	onDeposit: (depositBalances: TokenBalance[]) => void;
}

const DepositDialog = ({ show = false, onDeposit }: Props): JSX.Element => {
	const {
		user,
		network: { network },
	} = useContext(StoreContext);
	const classes = useStyles();
	const [mode, setMode] = useState(DepositType.token);
	const [userBalances, setUserBalances] = useState<TokenBalance[]>([]);
	const [depositBalances, setDepositBalances] = useState<TokenBalance[]>([]);

	const totalDeposit = depositBalances.reduce((total, balance) => total.plus(balance.value), new BigNumber(0));

	const handleChange = (tokenBalance: TokenBalance, index: number) => {
		const balances = [...depositBalances];
		balances[index] = tokenBalance;
		setDepositBalances(balances);
	};

	useEffect(() => {
		if (mode !== DepositType.token || !user.initialized) {
			return;
		}

		const balances = [
			user.getTokenBalance(mainnetDeploy.tokens['renBTC']),
			user.getTokenBalance(mainnetDeploy.tokens['wBTC']),
			user.getTokenBalance(mainnetDeploy.tokens['ibBTC']),
		];

		balances[0].token.name = 'wBTC';
		balances[1].token.name = 'wBTC';
		balances[2].token.name = 'ibBTC';

		setDepositBalances(balances);
		setUserBalances(balances);
	}, [mode, user, user.initialized]);

	useEffect(() => {
		if (mode !== DepositType.lpToken) {
			return;
		}

		const lpTokenSett = network.setts.find(
			(sett) => sett.depositToken.address === ETH_DEPLOY.tokens['curve.ibBTC'],
		);

		if (!lpTokenSett) {
			return;
		}

		const lpTokenBalance = user.getBalance(BalanceNamespace.Sett, lpTokenSett);

		lpTokenBalance.token.name = 'LP Token';

		setDepositBalances([lpTokenBalance]);
		setUserBalances([lpTokenBalance]);
	}, [network, user, mode]);

	return (
		<Dialog open={show} fullWidth maxWidth="sm" classes={{ paperWidthSm: classes.root }}>
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
							<Typography variant="body1">RenBTC / wBTC/ ibBTC LP</Typography>
							<Typography variant="body1">Convex</Typography>
						</Box>
					</Grid>
					<Tabs
						className={classes.tabs}
						value={mode}
						textColor="primary"
						indicatorColor="primary"
						aria-label="deposit modes"
					>
						<Tab
							className={classes.tab}
							value={DepositType.token}
							label="RenBTC, wBTC & ibBTC"
							onClick={() => setMode(DepositType.token)}
						/>
						<Tab
							className={classes.tab}
							value={DepositType.lpToken}
							label="LP Token"
							onClick={() => setMode(DepositType.lpToken)}
						/>
					</Tabs>
					<div className={classes.inputsContainer}>
						{userBalances.map((tokenBalance, index) => (
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
					<Typography variant="body1">{inCurrency(totalDeposit, Currency.USD)}</Typography>
				</Grid>
				<Button
					fullWidth
					variant="contained"
					color="primary"
					className={classes.depositButton}
					disabled={totalDeposit.isZero()}
					onClick={() => onDeposit(depositBalances)}
				>
					Deposit
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default observer(DepositDialog);
