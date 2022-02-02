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
import { VaultModalProps } from '../common/dialogs/VaultDeposit';
import { Loader } from '../../components/Loader';
import SlippageMessage from './SlippageMessage';
import { debounce } from '../../utils/componentHelpers';
import { ReportProblem } from '@material-ui/icons';
import { BalanceNamespace } from '../../web3/config/namespaces';
import clsx from 'clsx';
import { StrategyFees } from '../common/StrategyFees';

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
		right: 16,
		top: 24,
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
	Tokens = 'tokens',
	LiquidityToken = 'liquidity-token',
}

const IbbtcVaultDepositDialog = ({ open = false, onClose }: VaultModalProps): JSX.Element => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { contracts, network, onboard, vaults, uiState, user } = store;

	// lp token getters
	const lpVault = vaults.getVault(mainnetDeploy.sett_system.vaults['native.ibbtcCrv']);
	const lpBadgerVault = network.network.vaults.find(({ vaultToken }) => vaultToken.address === lpVault?.vaultToken);
	const userLpTokenBalance = lpBadgerVault ? user.getBalance(BalanceNamespace.Token, lpBadgerVault) : undefined;
	const userHasLpTokenBalance = userLpTokenBalance?.tokenBalance.gt(0);
	const settStrategy = lpBadgerVault ? network.network.strategies[lpBadgerVault.vaultToken.address] : undefined;

	// options
	const [mode, setMode] = useState(userHasLpTokenBalance ? DepositMode.LiquidityToken : DepositMode.Tokens);
	const [depositOptions, setDepositOptions] = useState<TokenBalance[]>([]);

	// user inputs
	const [slippage, setSlippage] = useState(0.3);
	const [multiTokenDepositBalances, setMultiTokenDepositBalances] = useState<TokenBalance[]>([]);
	const [lpTokenDepositBalance, setLpTokenDepositBalance] = useState<TokenBalance>();

	// calculations
	const [slippageRevertProtected, setSlippageRevertProtected] = useState(false);
	const [expectedSlippage, setExpectedSlippage] = useState<BigNumber>();
	const [expectedPoolTokens, setExpectedPoolTokens] = useState<TokenBalance>();
	const [minPoolTokens, setMinPoolTokens] = useState<TokenBalance>();

	const areUserTokenBalancesAvailable = Object.keys(user.tokenBalances).length > 0;
	const isLoading = !areUserTokenBalancesAvailable || !lpBadgerVault;

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
			const ibbtcVaultPeak = new web3.eth.Contract(IbbtcVaultZapAbi as AbiItem[], mainnetDeploy.ibbtcVaultZap);

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

		const [calculatedMint, expectedAmount] = await getCalculations(multiTokenDepositBalances);
		const minOut = expectedAmount.multipliedBy(1 - newSlippage / 100);
		const calculatedSlippage = expectedAmount.minus(calculatedMint).multipliedBy(100).dividedBy(expectedAmount);

		setSlippage(newSlippage);
		setMinPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, minOut));
		setExpectedPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, calculatedMint));
		setSlippageRevertProtected(calculatedMint.isLessThan(minOut));
		setExpectedSlippage(calculatedSlippage);
	};

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
				setExpectedPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, calculatedMint));
			}

			// this will protect users from submitting tx that will be reverted because of slippage
			setSlippageRevertProtected(calculatedMint.isLessThan(minOut));
			setExpectedSlippage(calculatedSlippage);
			setMultiTokenDepositBalances(balances);
		}),
		[getCalculations, resetCalculatedInformation, userLpTokenBalance, multiTokenDepositBalances, slippage],
	);

	const handleLpTokenDeposit = async () => {
		if (!lpTokenDepositBalance || !userLpTokenBalance || !lpVault || !lpBadgerVault) {
			return;
		}

		await contracts.deposit(lpVault, lpBadgerVault, userLpTokenBalance, lpTokenDepositBalance);
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

		const allowanceApprovals = [];

		for (const depositBalance of multiTokenDepositBalances) {
			const allowance = await contracts.getAllowance(depositBalance.token, mainnetDeploy.ibbtcVaultZap);

			if (allowance.tokenBalance.lt(depositBalance.tokenBalance)) {
				allowanceApprovals.push(contracts.increaseAllowance(depositBalance.token, mainnetDeploy.ibbtcVaultZap));
			}
		}

		await Promise.all(allowanceApprovals);

		const web3 = new Web3(onboard.wallet?.provider);
		const ibbtcVaultPeakRead = new web3.eth.Contract(IbbtcVaultZapAbi as AbiItem[], mainnetDeploy.ibbtcVaultZap);
		const ibbtcVaultPeak = new web3.eth.Contract(IbbtcVaultZapAbi as AbiItem[], mainnetDeploy.ibbtcVaultZap);

		const depositAmounts = multiTokenDepositBalances.map((balance) => toHex(balance.tokenBalance));
		const expectedAmount = new BigNumber(await ibbtcVaultPeakRead.methods.expectedAmount(depositAmounts).call());
		const minOut = expectedAmount.multipliedBy(1 - slippage / 100).toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		const deposit = ibbtcVaultPeak.methods.deposit(depositAmounts, toHex(new BigNumber(minOut)), false);
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

	useEffect(() => {
		const lpVault = vaults.getVault(mainnetDeploy.sett_system.vaults['native.ibbtcCrv']);
		const lpBadgerVault = network.network.vaults.find(
			({ vaultToken }) => vaultToken.address === lpVault?.vaultToken,
		);
		const userLpTokenBalance = lpBadgerVault ? user.getBalance(BalanceNamespace.Token, lpBadgerVault) : undefined;

		if (!userLpTokenBalance) {
			return;
		}

		const userHasLpTokenBalance = userLpTokenBalance.tokenBalance.gt(0);

		setLpTokenDepositBalance(userLpTokenBalance);
		setMode(userHasLpTokenBalance ? DepositMode.LiquidityToken : DepositMode.Tokens);
	}, [user, vaults, network.network.vaults]);

	return (
		<Dialog open={open} fullWidth maxWidth="sm" classes={{ paperWidthSm: classes.root }}>
			<DialogTitle className={classes.title}>
				Deposit Tokens
				<IconButton className={classes.closeButton} onClick={handleClosing}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent className={classes.content}>
				{isLoading ? (
					<Grid container direction="column">
						<Grid item className={classes.loader}>
							<Loader size={48} />
						</Grid>
						<Grid item container justifyContent="center">
							<Typography variant="h6" display="inline">
								Loading
							</Typography>
						</Grid>
					</Grid>
				) : (
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
									value={DepositMode.Tokens}
									label="ibBTC, renBTC, WBTC & sBTC"
								/>
								<Tab className={classes.tab} value={DepositMode.LiquidityToken} label="LP Token" />
							</Tabs>
							<Grid container direction="column" className={classes.inputsContainer}>
								{mode === DepositMode.Tokens ? (
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
											justifyContent="space-between"
											alignItems="center"
											className={classes.inputRow}
										>
											<Typography variant="subtitle2">Slippage</Typography>
											<RadioGroup
												row
												value={slippage}
												onChange={(event) => handleSlippageChange(Number(event.target.value))}
											>
												{[0.15, 0.3, 0.5, 1].map((slippageOption, index) => (
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
								<Grid item container justifyContent="space-between">
									<Typography variant="body2">Expected Pool Tokens Received:</Typography>
									<Typography variant="body2">{expectedPoolTokens.balanceDisplay(4)}</Typography>
								</Grid>
							)}
							{minPoolTokens && (
								<Grid item container justifyContent="space-between">
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
				)}
				<Divider className={classes.divider} variant="fullWidth" />
				{lpVault && settStrategy && <StrategyFees vault={lpVault} strategy={settStrategy} />}
				<Button
					fullWidth
					variant="contained"
					color="primary"
					className={classes.depositButton}
					disabled={mode === DepositMode.Tokens ? multiTokenDisabled : lpTokenDisabled}
					onClick={mode === DepositMode.Tokens ? handleMultiTokenDeposit : handleLpTokenDeposit}
				>
					{slippageRevertProtected ? 'Slippage out of range' : 'Deposit'}
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default observer(IbbtcVaultDepositDialog);
