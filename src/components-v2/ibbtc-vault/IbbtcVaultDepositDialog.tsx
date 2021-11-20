import React, { useCallback, useContext, useEffect, useState } from 'react';
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
	Tab,
	Tabs,
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
import SlippageMessage from './SlippageMessage';
import { debounce } from '../../utils/componentHelpers';
import { ReportProblem } from '@material-ui/icons';
import { BalanceNamespace } from '../../web3/config/namespaces';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: 680,
	},
	tab: {
		textTransform: 'none',
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
		marginTop: theme.spacing(1.5),
	},
	divider: {
		margin: theme.spacing(1, 0),
	},
	inputsContainer: {
		marginTop: theme.spacing(2),
	},
	depositButton: {
		marginTop: theme.spacing(1),
	},
	loader: {
		marginBottom: theme.spacing(1),
	},
	slippageProtectionContainer: {
		borderRadius: 8,
		border: '1px solid #D97706',
		marginTop: theme.spacing(1.5),
		padding: theme.spacing(1),
	},
	slippageProtectionMessage: {
		color: '#D97706',
		verticalAlign: 'middle',
		display: 'inline-flex',
	},
	warningIcon: {
		color: '#D97706',
		marginRight: theme.spacing(1),
	},
	depositContent: {
		marginTop: theme.spacing(2),
	},
	estimations: {},
}));

enum DepositMode {
	tokens = 'tokens',
	lpToken = 'lp-token',
}

const ibbtcVaultPeakAddress = mainnetDeploy.ibbtcVaultZap;

const IbbtcVaultDepositDialog = ({ open = false, onClose }: SettModalProps): JSX.Element => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { contracts, network, onboard, setts, uiState, user } = store;

	const lpSett = setts.getSett(mainnetDeploy.sett_system.vaults['native.ibbtcCrv']);
	const lpBadgerSett = network.network.setts.find(({ vaultToken }) => vaultToken.address === lpSett?.settToken);
	const userLpTokenBalance = lpBadgerSett ? user.getBalance(BalanceNamespace.Sett, lpBadgerSett) : undefined;
	const userHasLpTokenBalance = userLpTokenBalance?.tokenBalance.gt(0);

	const [mode, setMode] = useState(userHasLpTokenBalance ? DepositMode.lpToken : DepositMode.tokens);
	const [slippageRevertProtected, setSlippageRevertProtected] = useState(false);
	const [slippage, setSlippage] = useState(0.3);
	const [expectedSlippage, setExpectedSlippage] = useState<BigNumber>();
	const [depositOptions, setDepositOptions] = useState<TokenBalance[]>([]);
	const [multiTokenDepositBalances, setMultiTokenDepositBalances] = useState<TokenBalance[]>([]);
	const [lpTokenDepositBalance, setLpTokenDepositBalance] = useState<TokenBalance>();
	const [expectedPoolTokens, setExpectedPoolTokens] = useState<TokenBalance>();
	const [minPoolTokens, setMinPoolTokens] = useState<TokenBalance>();

	const areOptionAvailable = Object.keys(user.tokenBalances).length > 0 && lpBadgerSett;
	const totalDeposit = multiTokenDepositBalances.reduce(
		(total, balance) => total.plus(balance.tokenBalance),
		new BigNumber(0),
	);

	const multiTokenDisabled = totalDeposit.isZero() || slippageRevertProtected;
	const lpTokenDisabled = !lpTokenDepositBalance || lpTokenDepositBalance.tokenBalance.isZero();

	const resetCalculatedInformation = useCallback(() => {
		setMultiTokenDepositBalances(depositOptions);
		setSlippageRevertProtected(false);
		setExpectedSlippage(undefined);
		setExpectedPoolTokens(undefined);
		setMinPoolTokens(undefined);
	}, [depositOptions]);

	const getCalculations = useCallback(
		async (balances: TokenBalance[]): Promise<BigNumber[]> => {
			const web3 = new Web3(onboard.wallet?.provider);
			const ibbtcVaultPeak = new web3.eth.Contract(IbbtcVaultZapAbi as AbiItem[], ibbtcVaultPeakAddress);

			const depositAmounts = balances.map((balance) => toHex(balance.tokenBalance));

			const [calculatedMint, expectedAmount] = await Promise.all([
				new BigNumber(await ibbtcVaultPeak.methods.calcMint(depositAmounts, false).call()),
				new BigNumber(await ibbtcVaultPeak.methods.expectedAmount(depositAmounts).call()),
			]);

			return [calculatedMint, expectedAmount];
		},
		[onboard],
	);

	const handleClosing = () => {
		setSlippageRevertProtected(false);
		setExpectedSlippage(undefined);
		onClose();
	};

	const handleModeChange = (newMode: DepositMode) => {
		resetCalculatedInformation();
		setMode(newMode);
	};

	const handleSlippageChange = async (newSlippage: number) => {
		if (!userLpTokenBalance) {
			return;
		}

		const { 1: expectedAmount } = await getCalculations(multiTokenDepositBalances);
		const minOut = expectedAmount.multipliedBy(1 - newSlippage / 100);

		setMinPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, minOut));
		setExpectedPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, expectedAmount));
		setSlippage(newSlippage);
	};

	// reason: the plugin does not recognize the dependency inside the debounce function
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleDepositBalanceChange = useCallback(
		debounce(200, async (tokenBalance: TokenBalance, index: number) => {
			const balances = [...multiTokenDepositBalances];
			balances[index] = tokenBalance;

			const totalDeposit = balances.reduce(
				(total, balance) => total.plus(balance.tokenBalance),
				new BigNumber(0),
			);

			if (totalDeposit.isZero()) {
				resetCalculatedInformation();
				return;
			}

			const [calculatedMint, expectedAmount] = await getCalculations(balances);

			// formula is: slippage = [(expectedAmount - calculatedMint) * 100] / expectedAmount
			const calculatedSlippage = expectedAmount.minus(calculatedMint).multipliedBy(100).dividedBy(expectedAmount);
			const minOut = expectedAmount.multipliedBy(1 - slippage / 100);

			if (userLpTokenBalance) {
				setMinPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, minOut));
				setExpectedPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, expectedAmount));
			}

			// this will protect users from submitting tx that will be reverted because of slippage
			setSlippageRevertProtected(calculatedMint.isLessThan(minOut));
			setExpectedSlippage(calculatedSlippage);
			setMultiTokenDepositBalances(balances);
		}),
		[getCalculations, resetCalculatedInformation, userLpTokenBalance, multiTokenDepositBalances, slippage],
	);

	const handleLpTokenDeposit = async () => {
		if (!lpTokenDepositBalance || !userLpTokenBalance || !lpSett || !lpBadgerSett) {
			return;
		}

		await contracts.deposit(lpSett, lpBadgerSett, userLpTokenBalance, lpTokenDepositBalance);
	};

	const handleMultiTokenDeposit = async () => {
		const invalidBalance = multiTokenDepositBalances.find((depositBalance, index) => {
			const depositOption = depositOptions[index];
			return depositBalance.tokenBalance.gt(depositOption.tokenBalance);
		});

		if (invalidBalance) {
			uiState.queueError(`Insufficient ${invalidBalance.token.symbol} balance for deposit`);
			return;
		}

		for (const depositBalance of multiTokenDepositBalances) {
			const allowance = await contracts.getAllowance(depositBalance.token, ibbtcVaultPeakAddress);

			if (allowance.tokenBalance.lt(depositBalance.tokenBalance)) {
				await contracts.increaseAllowance(depositBalance.token, ibbtcVaultPeakAddress);
			}
		}

		const web3 = new Web3(onboard.wallet?.provider);
		const ibbtcVaultPeak = new web3.eth.Contract(IbbtcVaultZapAbi as AbiItem[], ibbtcVaultPeakAddress);

		const depositAmounts = multiTokenDepositBalances.map((balance) => toHex(balance.tokenBalance));
		const expectedAmount = await new BigNumber(await ibbtcVaultPeak.methods.expectedAmount(depositAmounts).call());
		const minOut = expectedAmount.multipliedBy(1 - slippage / 100);

		const deposit = ibbtcVaultPeak.methods.deposit(depositAmounts, toHex(minOut), true);
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
		setDepositOptions([ibbtc, renBTC, wBTC, sBTC]);
		setMultiTokenDepositBalances([ibbtc, renBTC, wBTC, sBTC]);
	}, [user, user.initialized]);

	return (
		<Dialog open={open} fullWidth maxWidth="sm" classes={{ paperWidthSm: classes.root }}>
			<DialogTitle className={classes.title}>
				Deposit Tokens
				<IconButton className={classes.closeButton} onClick={handleClosing}>
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
						<Grid item container className={classes.depositContent}>
							<Tabs
								value={mode}
								textColor="primary"
								indicatorColor="primary"
								onChange={(e, newMode) => handleModeChange(newMode)}
								aria-label="wrapped label tabs example"
							>
								<Tab
									className={classes.tab}
									value={DepositMode.tokens}
									label="ibBTC, renBTC, WBTC & sBTC"
								/>
								<Tab className={classes.tab} value={DepositMode.lpToken} label="LP Token" />
							</Tabs>
							<Grid container direction="column" className={classes.inputsContainer}>
								{mode === DepositMode.tokens ? (
									<>
										{depositOptions.map((tokenBalance, index) => (
											<Grid
												item
												key={`${tokenBalance.token.address}_${index}`}
												className={classes.inputRow}
											>
												<BalanceInput
													tokenBalance={tokenBalance}
													onChange={(change) => handleDepositBalanceChange(change, index)}
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
												onChange={(event) => handleSlippageChange(Number(event.target.value))}
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
									</>
								) : (
									<Grid item className={classes.inputRow}>
										{userLpTokenBalance && (
											<BalanceInput
												tokenBalance={userLpTokenBalance}
												onChange={(change) => setLpTokenDepositBalance(change)}
											/>
										)}
									</Grid>
								)}
							</Grid>
						</Grid>
						<Grid item container direction="column" className={clsx(classes.inputRow, classes.estimations)}>
							{expectedPoolTokens && (
								<Grid item container justify="space-between">
									<Typography variant="body2">Expected Pool Tokens Received:</Typography>
									<Typography variant="body2">{expectedPoolTokens.balanceDisplay(4)}</Typography>
								</Grid>
							)}
							{minPoolTokens && (
								<Grid item container justify="space-between">
									<Typography variant="body2">Min Pool tokens Received:</Typography>
									<Typography variant="body2">{minPoolTokens.balanceDisplay(4)}</Typography>
								</Grid>
							)}
							{expectedSlippage && (
								<Grid item>
									<SlippageMessage limitSlippage={slippage} calculatedSlippage={expectedSlippage} />
								</Grid>
							)}
						</Grid>
						{slippageRevertProtected && (
							<Grid
								item
								container
								direction="row"
								alignItems="center"
								className={classes.slippageProtectionContainer}
							>
								<Typography variant="subtitle2" className={classes.slippageProtectionMessage}>
									<ReportProblem className={classes.warningIcon} />
									With your current slippage selection the transaction will be reverted, please adjust
									either slippage limit or deposit amount.
								</Typography>
							</Grid>
						)}
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
					disabled={mode === DepositMode.tokens ? multiTokenDisabled : lpTokenDisabled}
					onClick={mode === DepositMode.tokens ? handleMultiTokenDeposit : handleLpTokenDeposit}
				>
					{slippageRevertProtected ? 'Slippage out of range' : 'Deposit'}
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default observer(IbbtcVaultDepositDialog);
