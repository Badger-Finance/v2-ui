import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
	Button,
	FormControlLabel,
	Grid,
	InputAdornment,
	OutlinedInput,
	Radio,
	RadioGroup,
	Tooltip,
	Typography,
} from '@material-ui/core';
import { makeStyles, styled } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { debounce } from 'utils/componentHelpers';
import { ZERO } from 'config/constants';
import { BigNumber } from 'bignumber.js';
import { OptionToken, OptionTokens } from './OptionTokens';
import { DownArrow } from './DownArrow';
import { StoreContext } from 'mobx/store-context';
import { useConnectWallet } from 'mobx/utils/hooks';
import {
	BalanceGrid,
	BorderedFocusableContainerGrid,
	EndAlignText,
	InputTokenActionButtonsGrid,
	InputTokenAmount,
	OutputAmountText,
	OutputBalanceText,
	OutputContentGrid,
	OutputTokenGrid,
	SummaryGrid,
} from './Common';
import { useNumericInput } from '../../utils/useNumericInput';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { Skeleton } from '@material-ui/lab';
import { TransactionRequestResult } from '../../mobx/utils/web3';

const SlippageContainer = styled(Grid)(({ theme }) => ({
	marginTop: theme.spacing(1),
	[theme.breakpoints.only('xs')]: {
		marginTop: theme.spacing(2),
	},
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
	flexDirection: 'row',
	marginLeft: theme.spacing(2),
}));

const useStyles = makeStyles({
	customSlippage: {
		padding: 8,
		width: 30,
	},
	loader: {
		display: 'inline-block',
		width: 32,
	},
});

const ActionButton = observer(({ children }): JSX.Element => {
	const { onboard } = useContext(StoreContext);
	const connectWallet = useConnectWallet();

	if (!onboard.address) {
		return (
			<Button fullWidth size="large" variant="contained" color="primary" onClick={connectWallet}>
				Connect Wallet
			</Button>
		);
	}

	return <>{children}</>;
});

export const Mint = observer((): JSX.Element => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const {
		ibBTCStore: { ibBTC, mintFeePercent, mintOptions, mintRates, tokenBalances, initialized },
		onboard,
	} = store;

	const [selectedToken, setSelectedToken] = useState<TokenBalance>();
	const [inputAmount, setInputAmount] = useState('');
	const [mintBalance, setMintBalance] = useState<TokenBalance>();
	const [outputAmount, setOutputAmount] = useState<string>();
	const [fee, setFee] = useState('0.000');
	const [totalMint, setTotalMint] = useState('0.000');
	const [slippage, setSlippage] = useState<string | undefined>('1');
	const [customSlippage, setCustomSlippage] = useState<string>();
	const { onValidChange, inputProps } = useNumericInput();
	const showSlippage = mintBalance ? store.ibBTCStore.isZapToken(mintBalance.token) : false;

	const mintBalanceRate = mintBalance ? mintRates[mintBalance.token.address] : undefined;

	const selectedTokenBalance = tokenBalances.find(
		(tokenBalance) => tokenBalance.token.address === mintBalance?.token.address,
	);

	const resetState = () => {
		setInputAmount('');
		setFee('0.000');
		setTotalMint('0.000');
	};

	const setMintInformation = (inputAmount: TokenBalance, outputAmount: TokenBalance, fee: TokenBalance): void => {
		setFee(fee.balanceDisplay(6));
		setTotalMint(outputAmount.balanceDisplay(6));
		setOutputAmount(outputAmount.balanceDisplay(6));
	};

	const calculateMintInformation = async (settTokenAmount: TokenBalance): Promise<void> => {
		const { bBTC, fee } = await store.ibBTCStore.calcMintAmount(settTokenAmount);
		setMintInformation(
			settTokenAmount,
			TokenBalance.fromBigNumber(ibBTC, bBTC),
			TokenBalance.fromBigNumber(ibBTC, fee),
		);
	};

	const handleInputChange = (change: string) => {
		if (!selectedToken) {
			return;
		}

		setInputAmount(change);
		setMintBalance(TokenBalance.fromBalance(selectedToken, change));
		debounceInputAmountChange(change);
	};

	const handleCustomSlippageChange = (change: string) => {
		setSlippage(undefined);
		setCustomSlippage(change);
	};

	const handleSlippageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCustomSlippage(undefined);
		setSlippage((event.target as HTMLInputElement).value);
	};

	const debounceInputAmountChange = useCallback(
		debounce(200, async (change: string): Promise<void> => {
			const input = new BigNumber(change);

			if (!selectedToken) {
				return;
			}

			if (!input.gt(ZERO)) {
				setOutputAmount(undefined);
				setFee('0.000');
				setTotalMint('0.000');
				return;
			}

			await calculateMintInformation(TokenBalance.fromBalance(selectedToken, change));
		}),
		[selectedToken],
	);

	const handleApplyMaxBalance = async (): Promise<void> => {
		if (!selectedToken) {
			return;
		}

		setInputAmount(selectedToken.balance.decimalPlaces(6, BigNumber.ROUND_HALF_FLOOR).toString());
		setMintBalance(selectedToken);
		await calculateMintInformation(selectedToken);
	};

	const handleTokenChange = async (tokenBalance: TokenBalance): Promise<void> => {
		setInputAmount(tokenBalance.balance.decimalPlaces(6, BigNumber.ROUND_HALF_FLOOR).toString());
		setSelectedToken(tokenBalance);
		setMintBalance(tokenBalance);
		await calculateMintInformation(tokenBalance);
	};

	const handleMintClick = async (): Promise<void> => {
		if (mintBalance && selectedToken) {
			const mintSlippage = new BigNumber(slippage || customSlippage || '');
			const isValidAmount = store.ibBTCStore.isValidAmount(mintBalance, selectedToken, mintSlippage);

			if (!isValidAmount) {
				return;
			}

			const txResult = await store.ibBTCStore.mint(mintBalance, mintSlippage);

			if (txResult === TransactionRequestResult.Success) {
				resetState();
			}
		}
	};

	useEffect(() => {
		resetState();
	}, [onboard.address]);

	useEffect(() => {
		const defaultBalance = mintOptions[0];

		// reload balance to load symbol that's loaded async
		if (!mintBalance && !selectedToken && defaultBalance.token.symbol) {
			setSelectedToken(defaultBalance);
			setMintBalance(defaultBalance);
		}
	}, [selectedToken, mintOptions, mintBalance]);

	return (
		<>
			<Grid container>
				<BalanceGrid item xs={12}>
					<EndAlignText variant="body1" color="textSecondary">
						Balance: {selectedTokenBalance?.balanceDisplay(6) ?? '0'}
					</EndAlignText>
				</BalanceGrid>
				<BorderedFocusableContainerGrid item container xs={12}>
					<Grid item xs={12} sm={5}>
						<InputTokenAmount
							inputProps={inputProps}
							disabled={!onboard.address}
							value={inputAmount || ''}
							placeholder="0.000"
							onChange={onValidChange(handleInputChange)}
						/>
					</Grid>
					<InputTokenActionButtonsGrid item container spacing={1} xs={12} sm={7}>
						{initialized ? (
							<>
								<Grid item>
									<Button size="small" variant="outlined" onClick={handleApplyMaxBalance}>
										max
									</Button>
								</Grid>
								<Grid item>
									<OptionTokens
										balances={mintOptions}
										selected={selectedToken || mintOptions[0]}
										onTokenSelect={handleTokenChange}
									/>
								</Grid>
							</>
						) : (
							<Skeleton width={172} height={70} />
						)}
					</InputTokenActionButtonsGrid>
				</BorderedFocusableContainerGrid>
				{showSlippage && (
					<SlippageContainer item container xs={12} alignItems="center">
						<Typography variant="body1" color="textSecondary">
							Max slippage:
						</Typography>
						<StyledRadioGroup
							aria-label="slippage-percentage"
							name="slippage-percentage"
							value={slippage || ''}
							onChange={handleSlippageChange}
						>
							<FormControlLabel value="0.5" control={<Radio color="primary" />} label="0.5%" />
							<FormControlLabel value="1" control={<Radio color="primary" />} label="1%" />
						</StyledRadioGroup>
						<OutlinedInput
							value={customSlippage || ''}
							onChange={onValidChange(handleCustomSlippageChange)}
							inputProps={{ className: classes.customSlippage, ...inputProps }}
							endAdornment={<InputAdornment position="end">%</InputAdornment>}
						/>
					</SlippageContainer>
				)}
			</Grid>
			<Grid item container alignItems="center" xs={12}>
				<DownArrow />
			</Grid>
			<Grid container>
				<Grid item xs={12}>
					<OutputBalanceText variant="body1" color="textSecondary">
						Balance: {ibBTC.balanceDisplay(6)}
					</OutputBalanceText>
				</Grid>
				<OutputContentGrid container item xs={12}>
					<Grid item xs={12} sm={9} md={12} lg={10}>
						<OutputAmountText variant="h1">{outputAmount || '0.000'}</OutputAmountText>
					</Grid>
					<OutputTokenGrid item container xs={12} sm={3} md={12} lg={2}>
						<OptionToken token={ibBTC.token} />
					</OutputTokenGrid>
				</OutputContentGrid>
			</Grid>
			{selectedToken && (
				<Grid item xs={12}>
					<SummaryGrid>
						<Grid item xs={12} container justify="space-between">
							<Grid item xs={6}>
								<Typography variant="subtitle1">Current Conversion Rate: </Typography>
							</Grid>
							<Grid item xs={6}>
								<EndAlignText variant="body1">
									1 {selectedToken.token.symbol} :{' '}
									{mintBalanceRate || <Skeleton className={classes.loader} />} {ibBTC.token.symbol}
								</EndAlignText>
							</Grid>
						</Grid>
						<Grid item xs={12} container justify="space-between">
							<Grid item xs={6}>
								<Typography variant="subtitle1">Fees: </Typography>
							</Grid>
							<Grid item xs={6}>
								<EndAlignText variant="body1">
									<Tooltip
										enterTouchDelay={0}
										enterDelay={0}
										leaveDelay={300}
										arrow
										placement="left"
										title={'Mint Fee: ' + mintFeePercent + '%'}
									>
										<span>
											{fee} {ibBTC.token.symbol}
										</span>
									</Tooltip>
								</EndAlignText>
							</Grid>
						</Grid>
						<Grid item xs={12} container justify="space-between">
							<Grid item xs={6}>
								<Typography variant="subtitle1">Total Mint Amount: </Typography>
							</Grid>
							<Grid item xs={6}>
								<EndAlignText variant="body1">{`${totalMint} ${ibBTC.token.symbol}`}</EndAlignText>
							</Grid>
						</Grid>
					</SummaryGrid>
				</Grid>
			)}
			<Grid item xs={12}>
				<ActionButton>
					<Button
						fullWidth
						size="large"
						variant="contained"
						color="primary"
						onClick={handleMintClick}
						disabled={!inputAmount || !outputAmount}
					>
						MINT
					</Button>
				</ActionButton>
			</Grid>
		</>
	);
});
