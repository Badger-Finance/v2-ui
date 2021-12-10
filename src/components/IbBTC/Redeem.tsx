import React, { useCallback, useContext, useState } from 'react';
import { Button, Typography, Grid, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';

import { debounce } from 'utils/componentHelpers';
import { ZERO } from 'config/constants';
import { OptionToken, OptionTokens } from './OptionTokens';
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
	OutputAmountText,
	OutputTokenGrid,
	ErrorText,
} from './Common';
import { useNumericInput } from '../../utils/useNumericInput';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';

type RedeemInformation = {
	inputAmount: TokenBalance;
	redeemAmount: TokenBalance;
	max: TokenBalance;
	fee: TokenBalance;
	conversionRate: TokenBalance;
};

const useStyles = makeStyles((theme) => ({
	outputContent: {
		marginTop: theme.spacing(4),
	},
	maxAmount: {
		cursor: 'pointer',
	},
}));

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

export const Redeem = observer((): any => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const {
		ibBTCStore: { redeemOptions, ibBTC, redeemFeePercent, tokenBalances, redeemRates },
		onboard,
	} = store;

	const [inputAmount, setInputAmount] = useState('');
	const [redeemBalance, setRedeemBalance] = useState(redeemOptions[0]);
	const [outputAmount, setOutputAmount] = useState<string>();
	const [conversionRate, setConversionRate] = useState<string>();
	const [maxRedeem, setMaxRedeem] = useState<BigNumber>();
	const [totalRedeem, setTotalRedeem] = useState('0.000');
	const [fee, setFee] = useState('0.000');
	const [isEnoughToRedeem, setIsEnoughToRedeem] = useState(true);
	const { onValidChange, inputProps } = useNumericInput();

	const redeemBalanceRedeemRate = redeemRates[redeemBalance.token.address];

	const resetState = () => {
		setInputAmount('');
		setOutputAmount(undefined);
		setMaxRedeem(undefined);
		setIsEnoughToRedeem(true);
		setFee('0.000');
		setTotalRedeem('0.000');
	};

	const setRedeemInformation = ({ inputAmount, redeemAmount, max, fee, conversionRate }: RedeemInformation): void => {
		setIsEnoughToRedeem(max.tokenBalance.gte(inputAmount.tokenBalance));
		setOutputAmount(redeemAmount.balanceDisplay(6));
		setFee(fee.balanceDisplay(6));
		setTotalRedeem(redeemAmount.balanceDisplay(6));
		setConversionRate(conversionRate.balanceDisplay(6));
	};

	const calculateRedeem = async (balance: TokenBalance): Promise<void> => {
		const [{ sett, fee, max }, conversionRate] = await Promise.all([
			store.ibBTCStore.calcRedeemAmount(balance),
			store.ibBTCStore.getRedeemConversionRate(balance.token),
		]);

		setMaxRedeem(max);
		setRedeemInformation({
			inputAmount: balance,
			redeemAmount: TokenBalance.fromBigNumber(balance, sett),
			max: TokenBalance.fromBigNumber(ibBTC, max),
			fee: TokenBalance.fromBigNumber(ibBTC, fee),
			conversionRate: TokenBalance.fromBigNumber(balance, conversionRate),
		});
	};

	const handleInputChange = (change: string) => {
		setInputAmount(change);
		setRedeemBalance(TokenBalance.fromBalance(ibBTC, change));
		debounceInputAmountChange(change);
	};

	// reason: the plugin does not recognize the dependency inside the debounce function
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounceInputAmountChange = useCallback(
		debounce(
			600,
			async (change): Promise<void> => {
				const input = new BigNumber(change);

				if (!input.gt(ZERO)) {
					setOutputAmount(undefined);
					setMaxRedeem(undefined);
					setIsEnoughToRedeem(true);
					setFee('0.000');
					setTotalRedeem('0.000');
					return;
				}

				await calculateRedeem(TokenBalance.fromBigNumber(redeemBalance, input));
			},
		),
		[redeemBalance],
	);

	const handleApplyMaxBalance = async (): Promise<void> => {
		const selectedTokenBalance = tokenBalances.find(
			(tokenBalance) => tokenBalance.token.address === redeemBalance.token.address,
		);

		if (selectedTokenBalance) {
			setRedeemBalance(selectedTokenBalance);
			await calculateRedeem(selectedTokenBalance);
		}
	};

	const handleLimitClick = async (limit: BigNumber): Promise<void> => {
		const limitBalance = TokenBalance.fromBigNumber(ibBTC, limit);
		setRedeemBalance(limitBalance);
		await calculateRedeem(limitBalance);
	};

	const handleTokenChange = async (tokenBalance: TokenBalance): Promise<void> => {
		setRedeemBalance(tokenBalance);
		await calculateRedeem(tokenBalance);
	};

	const handleRedeemClick = async (): Promise<void> => {
		if (redeemBalance) {
			const isValidAmount = store.ibBTCStore.isValidAmount(redeemBalance);
			if (!isValidAmount) return;
			await store.ibBTCStore.redeem(redeemBalance);
			resetState();
		}
	};

	return (
		<>
			<Grid container>
				<BalanceGrid item xs={12}>
					<EndAlignText variant="body1" color="textSecondary">
						Balance: {ibBTC.balanceDisplay()}
					</EndAlignText>
				</BalanceGrid>
				<BorderedFocusableContainerGrid item container xs={12}>
					<Grid item xs={8} sm={7}>
						<InputTokenAmount
							inputProps={inputProps}
							value={inputAmount}
							disabled={!onboard.address}
							placeholder="0.000"
							onChange={onValidChange(handleInputChange)}
						/>
					</Grid>
					<InputTokenActionButtonsGrid item container spacing={1} xs={4} sm={5}>
						<Grid item>
							<Button size="small" variant="outlined" onClick={handleApplyMaxBalance}>
								max
							</Button>
						</Grid>
						<Grid item>
							<OptionToken token={ibBTC.token} />
						</Grid>
					</InputTokenActionButtonsGrid>
				</BorderedFocusableContainerGrid>
			</Grid>
			<Grid item container alignItems="center" xs={12}>
				<DownArrow />
			</Grid>
			<Grid container className={classes.outputContent}>
				<OutputContentGrid container item xs={12}>
					<Grid item xs={12} sm={7} md={12} lg={7}>
						<OutputAmountText variant="h1">{outputAmount || '0.000'}</OutputAmountText>
					</Grid>
					<OutputTokenGrid item container xs={12} sm={5} md={12} lg={5}>
						<OptionTokens
							balances={redeemOptions}
							selected={redeemBalance}
							onTokenSelect={handleTokenChange}
						/>
					</OutputTokenGrid>
				</OutputContentGrid>
			</Grid>
			<Grid item xs={12}>
				<SummaryGrid>
					{!isEnoughToRedeem && maxRedeem && (
						<Grid item xs={12} container>
							<ErrorText variant="subtitle1">
								<span>A maximum of </span>
								<Tooltip
									enterTouchDelay={0}
									className={classes.maxAmount}
									title="Apply limit"
									arrow
									placement="top"
									onClick={() => handleLimitClick(maxRedeem)}
								>
									<span>{ibBTC.balanceDisplay(6)}</span>
								</Tooltip>
								<span>
									{' '}
									{ibBTC.token.symbol} can be redeemed for {redeemBalance.token.symbol}.
								</span>
							</ErrorText>
						</Grid>
					)}
					<Grid item xs={12} container justify="space-between">
						<Grid item xs={6}>
							<Typography variant="subtitle1">Current Conversion Rate: </Typography>
						</Grid>
						<Grid item xs={6}>
							<EndAlignText variant="body1">
								1 {ibBTC.token.symbol} : {conversionRate || redeemBalanceRedeemRate}{' '}
								{redeemBalance.token.symbol}
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
									title={'Redeem Fee: ' + redeemFeePercent + '%'}
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
							<Typography variant="subtitle1">Total Redeem Amount: </Typography>
						</Grid>
						<Grid item xs={6}>
							<EndAlignText variant="body1">{`${totalRedeem} ${redeemBalance.token.symbol}`}</EndAlignText>
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
						onClick={handleRedeemClick}
						disabled={!isEnoughToRedeem || !inputAmount || !outputAmount}
					>
						REDEEM
					</Button>
				</ActionButton>
			</Grid>
		</>
	);
});
