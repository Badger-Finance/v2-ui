import React, { useContext, useState } from 'react';
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

	const [selectedToken, setSelectedToken] = useState<TokenModel>(tokens[0]);
	const [inputAmount, setInputAmount] = useState<string>();
	const [outputAmount, setOutputAmount] = useState<string>();
	const initialFee = Math.max(1 - parseFloat(selectedToken.redeemRate), 0).toFixed(3);
	const [fee, setFee] = useState<string>(initialFee);
	const [isEnoughToRedeem, setIsEnoughToRedeem] = useState<boolean>(true);
	const [maxRedeem, setMaxRedeem] = useState<string>();
	const conversionRate =
		outputAmount && inputAmount
			? (
					parseFloat(outputAmount.toString() || selectedToken.redeemRate) /
					parseFloat(inputAmount.toString() || '1')
			  ).toFixed(4)
			: parseFloat(selectedToken.redeemRate).toFixed(4);

	const _debouncedSetInputAmount = debounce(600, (change) => {
		const input = new BigNumber(change);

		if (!input.gt(ZERO)) {
			setMaxRedeem('');
			setIsEnoughToRedeem(true);
			setOutputAmount('');
			setFee(initialFee);
			return;
		}

		store.ibBTCStore.calcRedeemAmount(selectedToken, selectedToken.scale(input), handleCalcOutputAmount).then();
	});

	const useMaxBalance = () => {
		if (ibBTC.balance.gt(ZERO) && selectedToken) {
			setInputAmount(ibBTC.unscale(ibBTC.balance).toString(10));
			store.ibBTCStore.calcRedeemAmount(selectedToken, ibBTC.balance, handleCalcOutputAmount).then();
		}
	};

	const handleCalcOutputAmount = (err: any, result: any): void => {
		if (!err) {
			const toBeRedeemed = selectedToken.unscale(new BigNumber(result[0]));
			const availableToRedeemed = ibBTC.unscale(new BigNumber(result.max));
			setMaxRedeem(availableToRedeemed.toFixed(4));
			setIsEnoughToRedeem(availableToRedeemed.gt(toBeRedeemed));
			setOutputAmount(toBeRedeemed.toString(10));
			setFee(ibBTC.unscale(new BigNumber(result[1])).toFixed(4));
			return;
		}

		setOutputAmount('');
	};

	const handleTokenSelection = (token: TokenModel) => {
		setSelectedToken(token);
		if (inputAmount) {
			store.ibBTCStore.calcMintAmount(token, token.scale(inputAmount), handleCalcOutputAmount).then();
		}
	};

	const resetState = () => {
		setInputAmount('');
		setOutputAmount('');
		setMaxRedeem('');
		setIsEnoughToRedeem(true);
		setFee(initialFee);
	};

	const handleRedeemClick = () => {
		if (inputAmount) {
			store.ibBTCStore.redeem(selectedToken, ibBTC.scale(new BigNumber(inputAmount)), handleRedeem);
		}
	};

	const handleRedeem = (): void => {
		resetState();
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
								_debouncedSetInputAmount(val);
							}}
						/>
					</Grid>
					<InputTokenActionButtonsGrid item container spacing={1} xs={4} sm={5}>
						<Grid item>
							<Button size="small" variant="outlined" onClick={useMaxBalance}>
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
						Balance: {ibBTC.formattedBalance}
					</OutputBalanceText>
				</Grid>
				<OutputContentGrid container item xs={12}>
					<Grid item xs={12} sm={7} md={12} lg={7}>
						<OutputAmountText variant="h1">{outputAmount || '0.00'}</OutputAmountText>
					</Grid>
					<OutputTokenGrid item container xs={12} sm={5} md={12} lg={5}>
						<Tokens tokens={tokens} selected={selectedToken} onTokenSelect={handleTokenSelection} />
					</OutputTokenGrid>
				</OutputContentGrid>
			</Grid>
			<Grid item xs={12}>
				<SummaryGrid>
					{!isEnoughToRedeem && (
						<Grid item xs={12} container justify="space-between">
							<ErrorText variant="subtitle1">
								A maximum of {maxRedeem} {ibBTC.symbol} can be redeemed to {selectedToken.symbol}
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
				</SummaryGrid>
			</Grid>
			<Grid item xs={12}>
				<Button
					fullWidth
					size="large"
					variant="contained"
					color="primary"
					onClick={handleRedeemClick}
					disabled={!isEnoughToRedeem || !inputAmount}
				>
					REDEEM
				</Button>
			</Grid>
		</>
	);
});
