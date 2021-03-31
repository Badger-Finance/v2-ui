import React, { useContext, useState } from 'react';
import { Container, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';

import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';

import { debounce } from 'utils/componentHelpers';
import { ZERO } from 'config/constants';
import { commonStyles } from './index';
import { Tokens } from './Tokens';
import { DownArrow } from './DownArrow';
import { StoreContext } from 'mobx/store-context';
import { TokenModel } from 'mobx/model';

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
				<Typography variant="caption" className={classes.balance}>
					Available {ibBTC.symbol}: {ibBTC.formattedBalance}
				</Typography>

				<div className={classes.inputWrapper}>
					<div className={classes.token}>
						<img src={ibBTC.icon} className={classes.tokenIcon} alt={ibBTC.name} />
						<Typography className={classes.tokenLabel} variant="body1">
							{ibBTC.symbol}
						</Typography>
					</div>
					<input
						className={classes.unstylishInput}
						onChange={handleInputAmount}
						type="number"
						ref={(ref) => (inputRef = ref)}
						min="0"
						placeholder="0.0"
					/>
					<Button className={classes.btnMax} variant="outlined" onClick={useMaxBalance}>
						max
					</Button>
				</div>
			</div>
			<div className={classes.outerWrapper}>
				<DownArrow />
			</div>
			<div className={classes.outerWrapper}>
				<Typography variant="caption" className={classes.balance}>
					Available {selectedToken.symbol}: {selectedToken.formattedBalance}
				</Typography>
				<div className={classes.inputWrapper}>
					<Tokens tokens={tokens} default={selectedToken.symbol} onTokenSelect={handleTokenSelection} />
					<input
						className={classes.unstylishInput}
						value={outputAmount}
						placeholder="0.0"
						type="number"
						min="0"
						readOnly
					/>
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
