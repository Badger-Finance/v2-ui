import React, { useCallback, useContext, useState } from 'react';
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
import { Token, Tokens } from './Tokens';
import { DownArrow } from './DownArrow';
import { StoreContext } from 'mobx/store-context';
import { toFixedDecimals } from 'mobx/utils/helpers';
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
import { IbbtcOptionToken } from '../../mobx/model/tokens/ibbtc-option-token';

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
			ibBTCStore: { ibBTC, mintFeePercent, mintOptions },
			onboard,
		} = store;

		const [selectedToken, setSelectedToken] = useState(mintOptions[0]);
		const [inputAmount, setInputAmount] = useState<InputAmount>();
		const [outputAmount, setOutputAmount] = useState<string>();
		const [conversionRate, setConversionRate] = useState<string>();
		const [fee, setFee] = useState('0.000');
		const [totalMint, setTotalMint] = useState('0.000');
		const [slippage, setSlippage] = useState<string | undefined>('1');
		const [customSlippage, setCustomSlippage] = useState<string>();
		const { onValidChange, inputProps } = useNumericInput();
		const showSlippage = store.ibBTCStore.isZapToken(selectedToken);

		const resetState = () => {
			setInputAmount(undefined);
			setOutputAmount(undefined);
			setFee('0.000');
			setTotalMint('0.000');
		};

		const setMintInformation = (inputAmount: BigNumber, outputAmount: BigNumber, fee: BigNumber): void => {
			setFee(toFixedDecimals(fee, 6));
			setTotalMint(toFixedDecimals(outputAmount, 6));
			setOutputAmount(toFixedDecimals(outputAmount, 6));
			setConversionRate(outputAmount.plus(fee).dividedBy(inputAmount).toFixed(6, BigNumber.ROUND_HALF_FLOOR));
		};

		const calculateMintInformation = async (
			settTokenAmount: BigNumber,
			settToken: IbbtcOptionToken,
		): Promise<void> => {
			const { bBTC, fee } = await store.ibBTCStore.calcMintAmount(settToken, settTokenAmount);
			setMintInformation(settToken.unscale(settTokenAmount), ibBTC.unscale(bBTC), ibBTC.unscale(fee));
		};

		const handleInputChange = (change: string) => {
			setInputAmount({
				displayValue: change,
				actualValue: selectedToken.scale(change),
			});
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

					await calculateMintInformation(selectedToken.scale(input), selectedToken);
				},
			),
			[selectedToken],
		);

		const handleApplyMaxBalance = async (): Promise<void> => {
			if (selectedToken.balance.gt(ZERO)) {
				setInputAmount({
					displayValue: selectedToken.unscale(selectedToken.balance).toFixed(6, BigNumber.ROUND_HALF_FLOOR),
					actualValue: selectedToken.balance,
				});
				await calculateMintInformation(selectedToken.balance, selectedToken);
			}
		};

		const handleTokenChange = async (token: IbbtcOptionToken): Promise<void> => {
			setSelectedToken(token);
			if (token.balance.gt(0)) {
				setInputAmount({
					displayValue: token.formattedBalance,
					actualValue: token.balance,
				});
				await calculateMintInformation(token.balance, token);
			}
		};

		const handleMintClick = async (): Promise<void> => {
			if (inputAmount?.actualValue && !inputAmount.actualValue.isNaN()) {
				const mintSlippage = new BigNumber(slippage || customSlippage || '');
				const isValidAmount = store.ibBTCStore.isValidAmount(
					selectedToken,
					inputAmount.actualValue,
					mintSlippage,
				);

				if (!isValidAmount) return;
				await store.ibBTCStore.mint(selectedToken, inputAmount.actualValue, mintSlippage);
				resetState();
			}
		};

		return (
			<>
				<Grid container>
					<BalanceGrid item xs={12}>
						<EndAlignText variant="body1" color="textSecondary">
							Balance: {selectedToken.formattedBalance}
						</EndAlignText>
					</BalanceGrid>
					<BorderedFocusableContainerGrid item container xs={12}>
						<Grid item xs={12} sm={5}>
							<InputTokenAmount
								inputProps={inputProps}
								disabled={!onboard.address}
								value={inputAmount?.displayValue || ''}
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
								<Tokens
									tokens={mintOptions}
									selected={selectedToken}
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
							Balance: {ibBTC.formattedBalance}
						</OutputBalanceText>
					</Grid>
					<OutputContentGrid container item xs={12}>
						<Grid item xs={12} sm={9} md={12} lg={10}>
							<OutputAmountText variant="h1">{outputAmount || '0.000'}</OutputAmountText>
						</Grid>
						<OutputTokenGrid item container xs={12} sm={3} md={12} lg={2}>
							<Token token={ibBTC} />
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
									1 {selectedToken.symbol} : {conversionRate || selectedToken.mintRate} {ibBTC.symbol}
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
											{fee} {ibBTC.symbol}
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
								<EndAlignText variant="body1">{`${totalMint} ${ibBTC.symbol}`}</EndAlignText>
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
							disabled={!inputAmount || !outputAmount}
						>
							MINT
						</Button>
					</ActionButton>
				</Grid>
			</>
		);
	},
);
