import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
	Button,
	Typography,
	Grid,
	InputAdornment,
	Tooltip,
	Radio,
	RadioGroup,
	FormControlLabel,
	OutlinedInput,
} from '@material-ui/core';
import { makeStyles, styled } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { debounce } from 'utils/componentHelpers';
import { ZERO } from 'config/constants';
import { BigNumber } from 'bignumber.js';
import { OptionToken as OptionToken, OptionTokens } from './OptionTokens';
import { DownArrow } from './DownArrow';
import { StoreContext } from 'mobx/store-context';
import { useConnectWallet } from 'mobx/utils/hooks';
import {
	EndAlignText,
	InputTokenAmount,
	BorderedFocusableContainerGrid,
	OutputContentGrid,
	SummaryGrid,
	BalanceGrid,
	InputTokenActionButtonsGrid,
	OutputBalanceText,
	OutputAmountText,
	OutputTokenGrid,
} from './Common';
import { useNumericInput } from '../../utils/useNumericInput';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';

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
});

type InputAmount = {
	displayValue: string;
	actualValue: BigNumber;
};

const ActionButton = observer(
	({ children }): JSX.Element => {
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
	},
);

export const Mint = observer(
	(): JSX.Element => {
		const store = useContext(StoreContext);
		const classes = useStyles();

		const {
			ibBTCStore: { ibBTC, mintFeePercent, mintOptions, mintRates, tokenBalances },
			onboard,
		} = store;

		const [mintBalance, setMintBalance] = useState(mintOptions[0]);
		const [outputAmount, setOutputAmount] = useState<string>();
		const [conversionRate, setConversionRate] = useState<string>();
		const [fee, setFee] = useState('0.000');
		const [totalMint, setTotalMint] = useState('0.000');
		const [slippage, setSlippage] = useState<string | undefined>('1');
		const [customSlippage, setCustomSlippage] = useState<string>();
		const { onValidChange, inputProps } = useNumericInput();
		const showSlippage = store.ibBTCStore.isZapToken(mintBalance.token);
		const displayedConversionRate = Number(conversionRate) || mintRates[mintBalance.token.address];

		useEffect(() => {
			resetState();
		}, [onboard.address]);

		const resetState = () => {
			// setMintBalance(undefined);
			setFee('0.000');
			setTotalMint('0.000');
		};

		const setMintInformation = (inputAmount: TokenBalance, outputAmount: TokenBalance, fee: TokenBalance): void => {
			setFee(fee.balanceDisplay(6));
			setTotalMint(outputAmount.balanceDisplay(6));
			setOutputAmount(outputAmount.balanceDisplay(6));
			setConversionRate(
				TokenBalance.fromBigNumber(
					outputAmount,
					outputAmount.tokenBalance.plus(fee.tokenBalance).dividedBy(inputAmount.tokenBalance),
				).balanceDisplay(6),
			);
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
			setMintBalance(TokenBalance.fromBalance(mintBalance, change));
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

		// reason: the plugin does not recognize the dependency inside the debounce function
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const debounceInputAmountChange = useCallback(
			debounce(
				600,
				async (change: string): Promise<void> => {
					const input = new BigNumber(change);

					if (!input.gt(ZERO)) {
						setOutputAmount(undefined);
						setFee('0.000');
						setTotalMint('0.000');
						return;
					}

					await calculateMintInformation(TokenBalance.fromBigNumber(mintBalance, input));
				},
			),
			[mintBalance],
		);

		const handleApplyMaxBalance = async (): Promise<void> => {
			const selectedTokenBalance = tokenBalances.find(
				(tokenBalance) => tokenBalance.token.address === mintBalance.token.address,
			);

			if (selectedTokenBalance) {
				setMintBalance(selectedTokenBalance);
				await calculateMintInformation(selectedTokenBalance);
			}
		};

		const handleTokenChange = async (tokenBalance: TokenBalance): Promise<void> => {
			setMintBalance(tokenBalance);
			await calculateMintInformation(tokenBalance);
		};

		const handleMintClick = async (): Promise<void> => {
			if (mintBalance) {
				const mintSlippage = new BigNumber(slippage || customSlippage || '');
				const isValidAmount = store.ibBTCStore.isValidAmount(mintBalance, mintSlippage);

				if (!isValidAmount) {
					return;
				}

				await store.ibBTCStore.mint(mintBalance, mintSlippage);
			}
		};

		return (
			<>
				<Grid container>
					<BalanceGrid item xs={12}>
						<EndAlignText variant="body1" color="textSecondary">
							Balance: {mintBalance.balanceDisplay(6)}
						</EndAlignText>
					</BalanceGrid>
					<BorderedFocusableContainerGrid item container xs={12}>
						<Grid item xs={12} sm={5}>
							<InputTokenAmount
								inputProps={inputProps}
								disabled={!onboard.address}
								value={mintBalance?.balance || ''}
								placeholder="0.000"
								onChange={onValidChange(handleInputChange)}
							/>
						</Grid>
						<InputTokenActionButtonsGrid item container spacing={1} xs={12} sm={7}>
							<Grid item>
								<Button size="small" variant="outlined" onClick={handleApplyMaxBalance}>
									max
								</Button>
							</Grid>
							<Grid item>
								<OptionTokens
									balances={mintOptions}
									selected={mintBalance}
									onTokenSelect={handleTokenChange}
								/>
							</Grid>
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
							Balance: {ibBTC.balanceDisplay()}
						</OutputBalanceText>
					</Grid>
					<OutputContentGrid container item xs={12}>
						<Grid item xs={12} sm={9} md={12} lg={10}>
							<OutputAmountText variant="h1">{outputAmount || '0.000'}</OutputAmountText>
						</Grid>
						<OutputTokenGrid item container xs={12} sm={3} md={12} lg={2}>
							<OptionToken balance={ibBTC} />
						</OutputTokenGrid>
					</OutputContentGrid>
				</Grid>
				<Grid item xs={12}>
					<SummaryGrid>
						<Grid item xs={12} container justify="space-between">
							<Grid item xs={6}>
								<Typography variant="subtitle1">Current Conversion Rate: </Typography>
							</Grid>
							<Grid item xs={6}>
								<EndAlignText variant="body1">
									1 {mintBalance.token.symbol} : {displayedConversionRate} {ibBTC.token.symbol}
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
				<Grid item xs={12}>
					<ActionButton>
						<Button
							fullWidth
							size="large"
							variant="contained"
							color="primary"
							onClick={handleMintClick}
							disabled={!mintBalance || !outputAmount}
						>
							MINT
						</Button>
					</ActionButton>
				</Grid>
			</>
		);
	},
);
