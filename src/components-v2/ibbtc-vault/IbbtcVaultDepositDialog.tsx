import {
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
import { ReportProblem } from '@material-ui/icons';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { IbbtcVaultZap__factory } from 'contracts';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Loader } from '../../components/Loader';
import mainnetDeploy from '../../config/deployments/mainnet.json';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { VaultModalProps } from '../common/dialogs/VaultDeposit';
import { StrategyFees } from '../common/StrategyFees';
import VaultLogo from '../landing/VaultLogo';
import BalanceInput from './BalanceInput';
import SlippageMessage from './SlippageMessage';

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
	const { contracts, network, wallet, vaults, uiState, user } = store;

	// lp token getters
	const lpVault = vaults.getVault(mainnetDeploy.sett_system.vaults['native.ibbtcCrv']);
	const lpBadgerVault = network.network.vaults.find(({ vaultToken }) => vaultToken.address === lpVault?.vaultToken);
	const userLpTokenBalance = lpBadgerVault ? user.getBalance(lpBadgerVault) : undefined;
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
		(total, balance) => total.add(balance.tokenBalance),
		ethers.constants.Zero,
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
			if (!wallet.web3Instance) return [];
			const ibbtcVaultPeak = IbbtcVaultZap__factory.connect(mainnetDeploy.ibbtcVaultZap, wallet.web3Instance);
			if (balances.length !== 4) {
				throw new Error('dafuq');
			}
			// const depositAmounts = balances.map((balance) => toHex(balance.tokenBalance));

			// TODO: FIX ME!!! THIS SHOULD NOT STILL BE THERE
			// IF YOU SKIP THIS REVIEWING YOU ARE JUST A BAD DOG AS JINTAO
			const depositAmounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish] = ['0', '0', '0', '0'];

			const [calculatedMint, expectedAmount] = await Promise.all([
				ibbtcVaultPeak.calcMint(depositAmounts, false),
				ibbtcVaultPeak.expectedAmount(depositAmounts),
			]);

			return [calculatedMint, expectedAmount];
		},
		[wallet],
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
		const minOut = expectedAmount.mul(1 - newSlippage / 100);
		const calculatedSlippage = expectedAmount.sub(calculatedMint).mul(100).div(expectedAmount);

		setSlippage(newSlippage);
		setMinPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, minOut));
		setExpectedPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, calculatedMint));
		setSlippageRevertProtected(calculatedMint.lt(minOut));
		setExpectedSlippage(calculatedSlippage);
	};

	const handleDepositBalanceChange = async (tokenBalance: TokenBalance, index: number) => {
		const balances = [...multiTokenDepositBalances];
		balances[index] = tokenBalance;
		const totalDeposit = balances.reduce(
			(total, balance) => total.add(balance.tokenBalance),
			ethers.constants.Zero,
		);

		if (totalDeposit.isZero()) {
			setMultiTokenDepositBalances(balances);
			setSlippageRevertProtected(false);
			setExpectedSlippage(undefined);
			setExpectedPoolTokens(undefined);
			setMinPoolTokens(undefined);
			return;
		}

		const [calculatedMint, expectedAmount] = await getCalculations(balances);
		// formula: slippage = [(expectedAmount - calculatedMint) * 100] / expectedAmount
		const calculatedSlippage = expectedAmount.sub(calculatedMint).mul(100).div(expectedAmount);
		const minOut = expectedAmount.mul(1 - slippage / 100);

		if (userLpTokenBalance) {
			setMinPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, minOut));
			setExpectedPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, calculatedMint));
		}

		// this will protect users from submitting tx that will be reverted because of slippage
		setSlippageRevertProtected(calculatedMint.lt(minOut));
		setExpectedSlippage(calculatedSlippage);
		setMultiTokenDepositBalances(balances);
	};

	const handleLpTokenDeposit = async () => {
		if (!lpTokenDepositBalance || !userLpTokenBalance || !lpVault || !lpBadgerVault) {
			return;
		}

		await contracts.deposit(lpVault, lpBadgerVault, userLpTokenBalance, lpTokenDepositBalance);
	};

	const handleMultiTokenDeposit = async () => {
		const { web3Instance } = wallet;

		const invalidBalance = multiTokenDepositBalances.find((depositBalance, index) => {
			const depositOption = depositOptions[index];
			return depositBalance.tokenBalance.gt(depositOption.tokenBalance);
		});

		if (!web3Instance) return;

		if (invalidBalance) {
			uiState.queueError(`Insufficient ${invalidBalance.token.symbol} balance for deposit`);
			return;
		}

		const allowanceApprovals = [];

		// TODO DOGGY PLEASE DO NOT LEAVE THIS COMMENTED
		// for (const depositBalance of multiTokenDepositBalances) {
		// 	const allowance = await contracts.getAllowance(depositBalance.token, mainnetDeploy.ibbtcVaultZap);

		// 	if (allowance.tokenBalance.lt(depositBalance.tokenBalance)) {
		// 		allowanceApprovals.push(contracts.increaseAllowance(depositBalance.token, mainnetDeploy.ibbtcVaultZap));
		// 	}
		// }

		// await Promise.all(allowanceApprovals);

		// const ibbtcVaultPeak = IbbtcVaultZap__factory.connect(mainnetDeploy.ibbtcVaultZap, web3Instance);

		// // const depositAmounts = multiTokenDepositBalances.map((balance) => balance.tokenBalance);
		// const depositAmounts: [BigNumberish, BigNumberish, BigNumberish, BigNumberish] = ['0', '0', '0', '0'];
		// const expectedAmount = await ibbtcVaultPeak.expectedAmount(depositAmounts);
		// const minOut = expectedAmount.mul(1 - slippage / 100);
		// const deposit = ibbtcVaultPeak.deposit(depositAmounts, minOut, false);
		// const options = await contracts.getMethodSendOptions(deposit);

		// uiState.queueNotification('Sign transaction to execute deposit', 'info');

		// await sendContractMethod(
		// 	store,
		// 	deposit,
		// 	options,
		// 	'Deposit transaction submitted',
		// 	'Deposit processed successfully',
		// );
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
		const lpBadgerVault = lpVault ? vaults.getVaultDefinition(lpVault) : undefined;
		const userLpTokenBalance = lpBadgerVault ? user.getBalance(lpBadgerVault) : undefined;

		if (!userLpTokenBalance) {
			return;
		}

		const userHasLpTokenBalance = userLpTokenBalance.tokenBalance.gt(0);

		setLpTokenDepositBalance(userLpTokenBalance);
		setMode(userHasLpTokenBalance ? DepositMode.LiquidityToken : DepositMode.Tokens);
	}, [user, vaults, network.network.vaults]);

	return (
		<Dialog open={open} fullWidth maxWidth="xl" classes={{ paperWidthXl: classes.root }}>
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
						<Grid item container>
							{lpVault && (
								<Box marginRight={2}>
									<VaultLogo tokens={lpVault.tokens} />
								</Box>
							)}
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
				{lpVault && <StrategyFees vault={lpVault} />}
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
