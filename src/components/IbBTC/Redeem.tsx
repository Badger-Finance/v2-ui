import React, { useCallback, useContext, useState } from 'react';
import { Button, Typography, Grid, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';

import { debounce } from 'utils/componentHelpers';
import { ZERO } from 'config/constants';
import { Token, Tokens } from './Tokens';
import { DownArrow } from './DownArrow';
import { StoreContext } from 'mobx/store-context';
import { TokenModel } from 'mobx/model';
import { useConnectWallet } from 'mobx/utils/hooks';
import { toFixedDecimals } from 'mobx/utils/helpers';
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

type RedeemInformation = {
	inputAmount: BigNumber;
	redeemAmount: BigNumber;
	max: BigNumber;
	fee: BigNumber;
	conversionRate: BigNumber;
};

type InputAmount = {
	displayValue: string;
	actualValue: BigNumber;
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
		const store = useContext(StoreContext);
		const { connectedAddress } = store.wallet;
		const connectWallet = useConnectWallet();

		if (!connectedAddress) {
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
		ibBTCStore: { tokens, ibBTC, redeemFeePercent },
		wallet: { connectedAddress },
	} = store;

	const [selectedToken, setSelectedToken] = useState(tokens[0]);
	const [inputAmount, setInputAmount] = useState<InputAmount>();
	const [outputAmount, setOutputAmount] = useState<string>();
	const [conversionRate, setConversionRate] = useState<string>();
	const [maxRedeem, setMaxRedeem] = useState<BigNumber>();
	const [totalRedeem, setTotalRedeem] = useState('0.000');
	const [fee, setFee] = useState('0.000');
	const [isEnoughToRedeem, setIsEnoughToRedeem] = useState(true);

	const resetState = () => {
		setInputAmount(undefined);
		setOutputAmount(undefined);
		setMaxRedeem(undefined);
		setIsEnoughToRedeem(true);
		setFee('0.000');
		setTotalRedeem('0.000');
	};

	const setRedeemInformation = ({ inputAmount, redeemAmount, max, fee, conversionRate }: RedeemInformation): void => {
		setIsEnoughToRedeem(max.gte(inputAmount));
		setOutputAmount(toFixedDecimals(redeemAmount, 6));
		setFee(toFixedDecimals(fee, 6));
		setTotalRedeem(toFixedDecimals(redeemAmount, 6));
		setConversionRate(conversionRate.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
	};

	const calculateRedeem = async (ibBTCAmount: BigNumber, token: TokenModel): Promise<void> => {
		const [{ sett, fee, max }, conversionRate] = await Promise.all([
			store.ibBTCStore.calcRedeemAmount(token, ibBTCAmount),
			store.ibBTCStore.getRedeemConversionRate(token),
		]);

		setMaxRedeem(max);
		setRedeemInformation({
			inputAmount: ibBTC.unscale(ibBTCAmount),
			redeemAmount: token.unscale(sett),
			max: ibBTC.unscale(max),
			fee: ibBTC.unscale(fee),
			conversionRate: token.unscale(conversionRate),
		});
	};

	// reason: the plugin does not recognize the dependency inside the debounce function
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleInputAmountChange = useCallback(
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

				await calculateRedeem(ibBTC.scale(input), selectedToken);
			},
		),
		[selectedToken],
	);

	const handleApplyMaxBalance = async (): Promise<void> => {
		if (ibBTC.balance.gt(ZERO) && selectedToken) {
			setInputAmount({
				displayValue: ibBTC.unscale(ibBTC.balance).toFixed(ibBTC.decimals, BigNumber.ROUND_HALF_FLOOR),
				actualValue: ibBTC.balance,
			});
			await calculateRedeem(ibBTC.balance, selectedToken);
		}
	};

	const handleLimitClick = async (limit: BigNumber): Promise<void> => {
		setInputAmount({
			displayValue: ibBTC.unscale(limit).toFixed(ibBTC.decimals, BigNumber.ROUND_HALF_FLOOR),
			actualValue: limit,
		});
		await calculateRedeem(limit, selectedToken);
	};

	const handleTokenChange = async (token: TokenModel): Promise<void> => {
		setSelectedToken(token);
		if (inputAmount?.actualValue && !inputAmount.actualValue.isNaN()) {
			await calculateRedeem(inputAmount.actualValue, token);
		}
	};

	const handleRedeemClick = async (): Promise<void> => {
		if (inputAmount?.actualValue && !inputAmount.actualValue.isNaN()) {
			await store.ibBTCStore.redeem(selectedToken, inputAmount.actualValue);
			resetState();
		}
	};

	return (
		<>
			<Grid container>
				<BalanceGrid item xs={12}>
					<EndAlignText variant="body1" color="textSecondary">
						Balance: {ibBTC.formattedBalance}
					</EndAlignText>
				</BalanceGrid>
				<BorderedFocusableContainerGrid item container xs={12}>
					<Grid item xs={8} sm={7}>
						<InputTokenAmount
							value={inputAmount?.displayValue}
							disabled={!connectedAddress}
							placeholder="0.000"
							onChange={(val) => {
								setInputAmount({
									displayValue: val,
									actualValue: ibBTC.scale(val),
								});
								handleInputAmountChange(val);
							}}
						/>
					</Grid>
					<InputTokenActionButtonsGrid item container spacing={1} xs={4} sm={5}>
						<Grid item>
							<Button size="small" variant="outlined" onClick={handleApplyMaxBalance}>
								max
							</Button>
						</Grid>
						<Grid item>
							<Token token={ibBTC} />
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
						<Tokens tokens={tokens} selected={selectedToken} onTokenSelect={handleTokenChange} />
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
									className={classes.maxAmount}
									title="Apply limit"
									arrow
									placement="top"
									onClick={() => handleLimitClick(maxRedeem)}
								>
									<span>{toFixedDecimals(ibBTC.unscale(maxRedeem), 6)}</span>
								</Tooltip>
								<span>
									{' '}
									{ibBTC.symbol} can be redeemed for {selectedToken.symbol}.
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
								1 {ibBTC.symbol} : {conversionRate || selectedToken.redeemRate} {selectedToken.symbol}
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
									enterDelay={0}
									leaveDelay={300}
									arrow
									placement="left"
									title={'Redeem Fee: ' + redeemFeePercent + '%'}
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
							<Typography variant="subtitle1">Total Redeem Amount: </Typography>
						</Grid>
						<Grid item xs={6}>
							<EndAlignText variant="body1">{`${totalRedeem} ${selectedToken.symbol}`}</EndAlignText>
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
