import { Button, Container, TextField, Typography } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { Token, Tokens } from './Tokens';

import BigNumber from 'bignumber.js';
import { DownArrow } from './DownArrow';
import { StoreContext } from 'mobx/store-context';
import { TokenModel } from 'mobx/model';
import { ZERO } from 'config/constants';
import { commonStyles } from './index';
import { debounce } from 'utils/componentHelpers';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import red from '@material-ui/core/colors/red';

const localStyle = makeStyles(() => ({
	error: {
		color: red[400],
	},
}));
export const Redeem = observer((): any => {
	const store = useContext(StoreContext);
	const classes = commonStyles();
	const scopedClasses = localStyle();

	const {
		ibBTCStore: { tokens, ibBTC },
	} = store;

	let inputRef: any;

	const [selectedToken, setSelectedToken] = useState<TokenModel>(tokens[0]);
	const [inputAmount, setInputAmount] = useState<string>();
	const [outputAmount, setOutputAmount] = useState<string>();
	const initialFee = (1 - parseFloat(selectedToken.redeemRate)).toFixed(3);
	const [fee, setFee] = useState<string>(initialFee);
	const [isEnoughToRedeem, setIsEnoughToRedeem] = useState<boolean>(true);
	const [maxRedeem, setMaxRedeem] = useState<string>();
	const conversionRate =
		outputAmount && inputAmount
			? (
					parseFloat(outputAmount.toString() || selectedToken.redeemRate) /
					parseFloat(inputAmount.toString() || '1')
			  ).toFixed(4)
			: (parseFloat(selectedToken.redeemRate) / 1).toFixed(4);

	const _debouncedSetInputAmount = debounce(600, (val) => {
		setInputAmount(val);
		val = new BigNumber(val);
		if (val.gt(ZERO))
			store.ibBTCStore.calcRedeemAmount(selectedToken, selectedToken.scale(val), handleCalcOutputAmount);
		else {
			setMaxRedeem('');
			setIsEnoughToRedeem(true);
			setOutputAmount('');
			setFee(initialFee);
		}
	});

	const handleCalcOutputAmount = (err: any, result: any): void => {
		if (!err) {
			const toBeRedeemed = selectedToken.unscale(new BigNumber(result[0]));
			const availableToRedeemed = ibBTC.unscale(new BigNumber(result.max));
			setMaxRedeem(availableToRedeemed.toFixed(4));
			setIsEnoughToRedeem(availableToRedeemed.gt(toBeRedeemed));
			setOutputAmount(toBeRedeemed.toString(10));
			setFee(ibBTC.unscale(new BigNumber(result[1])).toFixed(4));
		} else setOutputAmount('');
	};

	const handleInputAmount = (event: any) => {
		const nextValue = event?.target?.value;
		_debouncedSetInputAmount(nextValue);
	};

	const handleTokenSelection = (event: any) => {
		const token = tokens.find((token: TokenModel) => token.symbol === event?.target?.value) || tokens[0];
		setSelectedToken(token);
		if (inputAmount) store.ibBTCStore.calcRedeemAmount(token, token.scale(inputAmount), handleCalcOutputAmount);
	};

	const resetState = () => {
		setInputAmount((inputRef.value = ''));
		setOutputAmount('');
		setMaxRedeem('');
		setIsEnoughToRedeem(true);
		setFee(initialFee);
	};

	const useMaxBalance = () => {
		setInputAmount((inputRef.value = ibBTC.unscale(ibBTC.balance).toString(10)));
		store.ibBTCStore.calcRedeemAmount(selectedToken, ibBTC.balance, handleCalcOutputAmount);
	};
	const handleRedeemClick = () => {
		if (inputAmount) store.ibBTCStore.redeem(selectedToken, ibBTC.scale(new BigNumber(inputAmount)), handleRedeem);
	};

	const handleRedeem = (): void => {
		resetState();
	};

	return (
		<Container className={classes.root} maxWidth="lg">
			<div className={classes.outerWrapper}>
				<Typography variant="body1" color="textSecondary" className={classes.balance}>
					Balance: {ibBTC.formattedBalance}
				</Typography>
				<TextField
					variant="outlined"
					size="medium"
					placeholder="0.0"
					onChange={handleInputAmount}
					InputProps={{
						style: { fontSize: '3rem' },
						endAdornment: [
							// eslint-disable-next-line react/jsx-key
							<Button size="small" className={classes.btnMax} variant="outlined" onClick={useMaxBalance}>
								max
							</Button>,
							// eslint-disable-next-line react/jsx-key
							<div>
								<Token token={ibBTC} />
							</div>,
						],
					}}
				/>
			</div>
			<div className={classes.outerWrapper}>
				<DownArrow />
			</div>
			<div className={classes.outerWrapper}>
				<Typography variant="body1" color="textSecondary" className={classes.balance}>
					Balance: {ibBTC.formattedBalance}
				</Typography>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						padding: '0 1rem 0 1rem',
					}}
				>
					<Typography variant="h1">{outputAmount || '0.00'}</Typography>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-end',
						marginTop: '-2.5rem',
						padding: '0 0 2rem 1rem',
					}}
				>
					<Tokens tokens={tokens} selected={selectedToken} onTokenSelect={handleTokenSelection} />
				</div>
			</div>
			<div className={classes.outerWrapper}>
				<div className={classes.summaryWrapper}>
					{!isEnoughToRedeem && (
						<div className={classes.summaryRow}>
							<Typography variant="subtitle1" className={scopedClasses.error}>
								A maximum of {maxRedeem} {ibBTC.symbol} can be redeemed to {selectedToken.symbol}
							</Typography>
						</div>
					)}
					<div className={classes.summaryRow}>
						<Typography variant="subtitle1">Current Conversion Rate: </Typography>
						<Typography variant="subtitle1">
							1 {ibBTC.symbol} : {conversionRate} {selectedToken.symbol}
						</Typography>
					</div>
					<div className={classes.summaryRow}>
						<Typography variant="subtitle1">Fees: </Typography>
						<Typography variant="subtitle1">
							{fee} {ibBTC.symbol}
						</Typography>
					</div>
				</div>
			</div>
			<div className={classes.outerWrapper}>
				<Button
					size="large"
					variant="contained"
					color="primary"
					onClick={handleRedeemClick}
					disabled={!isEnoughToRedeem || !inputAmount}
				>
					REDEEM
				</Button>
			</div>
		</Container>
	);
});
