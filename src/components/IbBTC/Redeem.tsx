import React, { useCallback, useContext, useState } from 'react';
import { Button, Typography, Grid } from '@material-ui/core';

import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';

import { debounce } from 'utils/componentHelpers';
import { ZERO } from 'config/constants';
import { Token, Tokens } from './Tokens';
import { DownArrow } from './DownArrow';
import { StoreContext } from 'mobx/store-context';
import { TokenModel } from 'mobx/model';
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
	ErrorText,
} from './Common';

export const Redeem = observer((): any => {
	const store = useContext(StoreContext);

	const {
		ibBTCStore: { tokens, ibBTC },
	} = store;

	const [selectedToken, setSelectedToken] = useState(tokens[0]);
	const [inputAmount, setInputAmount] = useState<string>();
	const [outputAmount, setOutputAmount] = useState<string>();
	const [totalRedeem, setTotalRedeem] = useState('0.00');
	const [fee, setFee] = useState('0.000');
	const [isEnoughToRedeem, setIsEnoughToRedeem] = useState(true);
	const [maxRedeem, setMaxRedeem] = useState<string>();
	const [conversionRate, setConversionRate] = useState('1');

	const resetState = () => {
		setInputAmount('');
		setOutputAmount('');
		setMaxRedeem('');
		setIsEnoughToRedeem(true);
		setFee('0.000');
		setTotalRedeem('0.00');
	};

	const setRedeemInformation = (
		redeemAmount: BigNumber,
		max: BigNumber,
		fee: BigNumber,
		conversionRate: BigNumber,
	) => {
		setMaxRedeem(max.toFixed());
		setIsEnoughToRedeem(max.gt(redeemAmount));
		setOutputAmount(redeemAmount.toFixed());
		setFee(fee.toFixed());
		setTotalRedeem(redeemAmount.toFixed());
		setConversionRate(conversionRate.toFixed());
	};

	// reason: the plugin does not recognize the dependency inside the debounce function
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleInputAmountChange = useCallback(
		debounce(600, async (change) => {
			const input = new BigNumber(change);

			if (!input.gt(ZERO)) {
				setMaxRedeem('');
				setIsEnoughToRedeem(true);
				setOutputAmount('');
				setFee('0.000');
				setTotalRedeem('0.00');
				return;
			}

			const [{ sett, fee, max }, conversionRate] = await Promise.all([
				store.ibBTCStore.calcRedeemAmount(selectedToken, ibBTC.scale(input)),
				store.ibBTCStore.getRedeemConversionRate(selectedToken),
			]);

			setRedeemInformation(
				selectedToken.unscale(sett),
				ibBTC.unscale(max),
				ibBTC.unscale(fee),
				selectedToken.unscale(conversionRate),
			);
		}),
		[selectedToken],
	);

	const handleApplyMaxBalance = async () => {
		if (ibBTC.balance.gt(ZERO) && selectedToken) {
			setInputAmount(ibBTC.unscale(ibBTC.balance).toString());

			const [{ sett, fee, max }, conversionRate] = await Promise.all([
				store.ibBTCStore.calcRedeemAmount(selectedToken, ibBTC.balance),
				store.ibBTCStore.getRedeemConversionRate(selectedToken),
			]);

			setRedeemInformation(
				selectedToken.unscale(sett),
				ibBTC.unscale(max),
				ibBTC.unscale(fee),
				selectedToken.unscale(conversionRate),
			);
		}
	};

	const handleTokenChange = async (token: TokenModel) => {
		setSelectedToken(token);
		if (inputAmount) {
			const [{ sett, fee, max }, conversionRate] = await Promise.all([
				store.ibBTCStore.calcRedeemAmount(token, ibBTC.scale(inputAmount)),
				store.ibBTCStore.getRedeemConversionRate(token),
			]);

			setRedeemInformation(
				token.unscale(sett),
				ibBTC.unscale(max),
				ibBTC.unscale(fee),
				token.unscale(conversionRate),
			);
		}
	};

	const handleRedeemClick = async () => {
		if (inputAmount) {
			await store.ibBTCStore.redeem(selectedToken, ibBTC.scale(inputAmount));
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
							value={inputAmount}
							placeholder="0.0"
							onChange={(val) => {
								setInputAmount(val);
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
			<Grid container>
				<Grid item xs={12}>
					<OutputBalanceText variant="body1" color="textSecondary">
						Balance: {selectedToken.formattedBalance}
					</OutputBalanceText>
				</Grid>
				<OutputContentGrid container item xs={12}>
					<Grid item xs={12} sm={7} md={12} lg={7}>
						<OutputAmountText variant="h1">{outputAmount || '0.00'}</OutputAmountText>
					</Grid>
					<OutputTokenGrid item container xs={12} sm={5} md={12} lg={5}>
						<Tokens tokens={tokens} selected={selectedToken} onTokenSelect={handleTokenChange} />
					</OutputTokenGrid>
				</OutputContentGrid>
			</Grid>
			<Grid item xs={12}>
				<SummaryGrid>
					{!isEnoughToRedeem && (
						<Grid item xs={12} container>
							<ErrorText variant="subtitle1">
								A maximum of {maxRedeem} {ibBTC.symbol} can be redeemed to {selectedToken.symbol}.
							</ErrorText>
						</Grid>
					)}
					<Grid item xs={12} container justify="space-between">
						<Grid item xs={6}>
							<Typography variant="subtitle1">Current Conversion Rate: </Typography>
						</Grid>
						<Grid item xs={6}>
							<EndAlignText variant="body1">
								1 {ibBTC.symbol} : {conversionRate} {selectedToken.symbol}
							</EndAlignText>
						</Grid>
					</Grid>
					<Grid item xs={12} container justify="space-between">
						<Grid item xs={6}>
							<Typography variant="subtitle1">Fees: </Typography>
						</Grid>
						<Grid item xs={6}>
							<EndAlignText variant="body1">
								{fee} {ibBTC.symbol}
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
			</Grid>
		</>
	);
});
