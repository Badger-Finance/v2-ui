import React, { useCallback, useContext, useState } from 'react';
import { Button, Typography, Grid } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import { debounce } from 'utils/componentHelpers';
import { ZERO } from 'config/constants';
import { BigNumber } from 'bignumber.js';
import { Token, Tokens } from './Tokens';
import { DownArrow } from './DownArrow';

import { TokenModel } from 'mobx/model';
import { StoreContext } from 'mobx/store-context';
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

export const Mint = observer((): any => {
	const store = useContext(StoreContext);

	const {
		ibBTCStore: { tokens, ibBTC },
	} = store;

	const [selectedToken, setSelectedToken] = useState(tokens[0]);
	const [inputAmount, setInputAmount] = useState<string>();
	const [outputAmount, setOutputAmount] = useState<string>();
	const [conversionRate, setConversionRate] = useState(parseFloat(selectedToken.mintRate).toFixed(4));
	const [fee, setFee] = useState('0.000');

	const resetState = () => {
		setInputAmount('');
		setOutputAmount('');
		setFee('0.00');
		setConversionRate(parseFloat(selectedToken.mintRate).toFixed(4));
	};

	const setMintInformation = (inputAmount: BigNumber, outputAmount: BigNumber, fee: BigNumber): void => {
		setOutputAmount(outputAmount.toString());
		setFee(fee.toFixed(4));
		setConversionRate(outputAmount.dividedBy(inputAmount).toFixed(4));
	};

	// reason: the plugin does not recognize the dependency inside the debounce function
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleInputAmountChange = useCallback(
		debounce(600, async (change: string) => {
			const input = new BigNumber(change);

			if (!input.gt(ZERO)) {
				setOutputAmount('');
				setFee('0.00');
				setConversionRate(parseFloat(selectedToken.mintRate).toFixed(4));
				return;
			}

			const { bBTC, fee } = await store.ibBTCStore.calcMintAmount(selectedToken, selectedToken.scale(input));
			setMintInformation(input, ibBTC.unscale(bBTC), ibBTC.unscale(fee));
		}),
		[selectedToken],
	);

	const handleApplyMaxBalance = async () => {
		if (selectedToken.balance.gt(ZERO)) {
			setInputAmount(selectedToken.unscale(selectedToken.balance).toString());
			const { bBTC, fee } = await store.ibBTCStore.calcMintAmount(selectedToken, selectedToken.balance);
			setMintInformation(selectedToken.unscale(selectedToken.balance), ibBTC.unscale(bBTC), ibBTC.unscale(fee));
		}
	};

	const handleTokenChange = async (token: TokenModel) => {
		setSelectedToken(token);
		if (inputAmount) {
			const { bBTC, fee } = await store.ibBTCStore.calcMintAmount(
				selectedToken,
				selectedToken.scale(inputAmount),
			);
			setMintInformation(new BigNumber(inputAmount), ibBTC.unscale(bBTC), ibBTC.unscale(fee));
		}
	};

	const handleMintClick = async () => {
		if (inputAmount) {
			await store.ibBTCStore.mint(selectedToken, selectedToken.scale(inputAmount));
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
							value={inputAmount}
							placeholder="0.0"
							onChange={(val) => {
								setInputAmount(val);
								handleInputAmountChange(val);
							}}
						/>
					</Grid>
					<InputTokenActionButtonsGrid item container spacing={1} xs={12} sm={7}>
						<Grid item>
							<Button size="small" variant="outlined" onClick={handleApplyMaxBalance}>
								max
							</Button>
						</Grid>
						<Grid item>
							<Tokens tokens={tokens} selected={selectedToken} onTokenSelect={handleTokenChange} />
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
					<Grid item xs={12} sm={9} md={12} lg={10}>
						<OutputAmountText variant="h1">{outputAmount || '0.00'}</OutputAmountText>
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
								1 {selectedToken.symbol} : {conversionRate} {ibBTC.symbol}
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
					onClick={handleMintClick}
					disabled={!inputAmount}
				>
					MINT
				</Button>
			</Grid>
		</>
	);
});
