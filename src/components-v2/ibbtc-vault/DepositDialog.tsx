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
	FormControlLabel,
	Grid,
	IconButton,
	Radio,
	RadioGroup,
	Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import BalanceInput from './BalanceInput';
import BigNumber from 'bignumber.js';

import Web3 from 'web3';
import IbbtcVaultZapAbi from '../../config/system/abis/IbbtcVaultZap.json';
import { AbiItem } from 'web3-utils';
import { toHex } from '../../mobx/utils/helpers';
import { sendContractMethod } from '../../mobx/utils/web3';
import { SettModalProps } from '../common/dialogs/SettDeposit';
import { Loader } from '../../components/Loader';

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
		marginTop: 21,
	},
	divider: {
		margin: theme.spacing(3, 0),
	},
	inputsContainer: {
		marginTop: theme.spacing(1),
	},
	depositButton: {
		marginTop: theme.spacing(3),
	},
	loader: {
		marginBottom: theme.spacing(1),
	},
}));

const DepositDialog = ({ open = false, onClose }: SettModalProps): JSX.Element => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { user, uiState, contracts, onboard } = store;
	const [slippage, setSlippage] = useState(0.3);
	const [depositOptions, setDepositOptions] = useState<TokenBalance[]>([]);
	const [depositBalances, setDepositBalances] = useState<TokenBalance[]>([]);

	const areOptionAvailable = Object.keys(user.tokenBalances).length > 0;
	const totalDeposit = depositBalances.reduce((total, balance) => total.plus(balance.tokenBalance), new BigNumber(0));

	const handleChange = (tokenBalance: TokenBalance, index: number) => {
		const balances = [...depositBalances];
		balances[index] = tokenBalance;
		setDepositBalances(balances);
	};

	const handleDeposit = async () => {
		const invalidBalance = depositBalances.find((depositBalance, index) => {
			const depositOption = depositOptions[index];
			return depositBalance.tokenBalance.gt(depositOption.tokenBalance);
		});

		if (invalidBalance) {
			uiState.queueError(`Insufficient ${invalidBalance.token.symbol} balance for deposit`);
			return;
		}

		const ibbtcVaultPeakAddress = mainnetDeploy.ibbtcVaultZap;

		for (const depositBalance of depositBalances) {
			const allowance = await contracts.getAllowance(depositBalance.token, ibbtcVaultPeakAddress);

			if (allowance.tokenBalance.lt(depositBalance.tokenBalance)) {
				await contracts.increaseAllowance(depositBalance.token, ibbtcVaultPeakAddress);
			}
		}

		const web3 = new Web3(onboard.wallet?.provider);
		const ibbtcVaultPeak = new web3.eth.Contract(IbbtcVaultZapAbi as AbiItem[], ibbtcVaultPeakAddress);

		const depositAmounts = depositBalances.map((balance) => toHex(balance.tokenBalance));
		const minOut = await ibbtcVaultPeak.methods.minOut(depositAmounts).call();
		const deposit = ibbtcVaultPeak.methods.deposit(depositAmounts, minOut, true);
		const options = await contracts.getMethodSendOptions(deposit);

		uiState.queueNotification('Sign transaction to execute deposit', 'info');

		await sendContractMethod(
			store,
			deposit,
			options,
			'Deposit transaction submitted',
			'Deposit processed successfully',
		);
	};

	useEffect(() => {
		const sBTC = user.getTokenBalance(mainnetDeploy.tokens['sBTC']);
		const renBTC = user.getTokenBalance(mainnetDeploy.tokens['renBTC']);
		const wBTC = user.getTokenBalance(mainnetDeploy.tokens['wBTC']);
		const ibbtc = user.getTokenBalance(mainnetDeploy.tokens['ibBTC']);
		setDepositOptions([sBTC, renBTC, wBTC, ibbtc]);
		setDepositBalances([sBTC, renBTC, wBTC, ibbtc]);
	}, [user, user.initialized]);

	return (
		<Dialog open={open} fullWidth maxWidth="sm" classes={{ paperWidthSm: classes.root }}>
			<DialogTitle className={classes.title}>
				Deposit Tokens
				<IconButton className={classes.closeButton} onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent className={classes.content}>
				{areOptionAvailable ? (
					<Grid container direction="column">
						<Grid item>
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
						<Grid item container direction="column" className={classes.inputsContainer}>
							{depositOptions.map((tokenBalance, index) => (
								<Grid item key={`${tokenBalance.token.address}_${index}`} className={classes.inputRow}>
									<BalanceInput
										tokenBalance={tokenBalance}
										onChange={(change) => handleChange(change, index)}
									/>
								</Grid>
							))}
							<Grid
								item
								container
								justify="space-between"
								alignItems="center"
								className={classes.inputRow}
							>
								<Typography variant="subtitle2">Slippage</Typography>
								<RadioGroup
									row
									value={slippage}
									onChange={(event) => setSlippage(Number(event.target.value))}
								>
									{[0.1, 0.3, 0.5, 1].map((slippageOption, index) => (
										<FormControlLabel
											key={`${slippageOption}_${index}`}
											control={<Radio color="primary" />}
											label={`${slippageOption}%`}
											value={slippageOption}
										/>
									))}
								</RadioGroup>
							</Grid>
						</Grid>
					</Grid>
				) : (
					<Grid container direction="column">
						<Grid item className={classes.loader}>
							<Loader size={48} />
						</Grid>
						<Grid item container justify="center">
							<Typography variant="h6" display="inline">
								Loading
							</Typography>
						</Grid>
					</Grid>
				)}
				<Divider className={classes.divider} variant="fullWidth" />
				<Button
					fullWidth
					variant="contained"
					color="primary"
					className={classes.depositButton}
					disabled={totalDeposit.isZero()}
					onClick={handleDeposit}
				>
					Deposit
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default observer(DepositDialog);
