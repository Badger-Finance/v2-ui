import React, { useContext, useState } from 'react';
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
	BorderedGrid,
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

	let inputRef: any;

	const [selectedToken, setSelectedToken] = useState<TokenModel>(tokens[0]);
	const [inputAmount, setInputAmount] = useState<string>();
	const [outputAmount, setOutputAmount] = useState<string>();
	const initialFee = (1 - parseFloat(selectedToken.mintRate)).toFixed(3);
	const [fee, setFee] = useState<string>(initialFee);
	const conversionRate =
		outputAmount && inputAmount
			? (
					parseFloat(outputAmount.toString() || selectedToken.mintRate) /
					parseFloat(inputAmount.toString() || '1')
			  ).toFixed(4)
			: parseFloat(selectedToken.mintRate).toFixed(4);

	const _debouncedSetInputAmount = debounce(600, async (change) => {
		const input = new BigNumber(change);
		if (input.gt(ZERO))
			await store.ibBTCStore.calcMintAmount(selectedToken, selectedToken.scale(input), handleCalcOutputAmount);
		else {
			setOutputAmount('');
			setFee(initialFee);
		}
	});

	const handleCalcOutputAmount = (err: any, result: any): void => {
		if (!err) {
			setOutputAmount(ibBTC.unscale(new BigNumber(result[0])).toString(10));
			setFee(ibBTC.unscale(new BigNumber(result[1])).toFixed(4));
		} else setOutputAmount('');
	};

	const handleTokenSelection = (token: TokenModel) => {
		setSelectedToken(token);
		if (inputAmount) {
			store.ibBTCStore.calcMintAmount(token, token.scale(inputAmount), handleCalcOutputAmount).then();
		}
	};

	const resetState = () => {
		setInputAmount((inputRef.value = ''));
		setOutputAmount('');
		setFee(initialFee);
	};

	const useMaxBalance = () => {
		if (inputRef) {
			setInputAmount((inputRef.value = selectedToken.unscale(selectedToken.balance).toString(10)));
			store.ibBTCStore.calcMintAmount(selectedToken, selectedToken.balance, handleCalcOutputAmount).then();
		}
	};
	const handleMintClick = () => {
		if (inputAmount) {
			store.ibBTCStore.mint(selectedToken, selectedToken.scale(new BigNumber(inputAmount)), handleMint);
		}
	};

	const handleMint = (): void => {
		resetState();
	};

	return (
		<>
			<Grid container>
				<BalanceGrid item xs={12}>
					<EndAlignText variant="body1" color="textSecondary">
						Balance: {selectedToken.formattedBalance}
					</EndAlignText>
				</BalanceGrid>
				<BorderedGrid item container xs={12}>
					<Grid item xs={12} sm={5}>
						<InputTokenAmount
							value={inputAmount}
							placeholder="0.0"
							onChange={(val) => {
								setInputAmount(val);
								_debouncedSetInputAmount(val);
							}}
						/>
					</Grid>
					<InputTokenActionButtonsGrid item container spacing={1} xs={12} sm={7}>
						<Grid item>
							<Button size="small" variant="outlined" onClick={useMaxBalance}>
								max
							</Button>
						</Grid>
						<Grid item>
							<Tokens tokens={tokens} selected={selectedToken} onTokenSelect={handleTokenSelection} />
						</Grid>
					</InputTokenActionButtonsGrid>
				</BorderedGrid>
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
			<Grid xs={12}>
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
