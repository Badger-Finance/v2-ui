import React, { useContext, useState } from 'react';
import { Container, Button, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import { commonStyles, debounce } from './index';
import { BigNumber } from 'bignumber.js';
import { Tokens } from './Tokens';

import { TokenModel } from 'mobx/model';
import { StoreContext } from 'mobx/store-context';

const ZERO = new BigNumber(0);

export const Mint = observer((): any => {
	const store = useContext(StoreContext);
	const classes = commonStyles();

	const {
		ibBTCStore: { tokens, ibBTC },
	} = store;

	let inputRef: any;

	const [selectedToken, setSelectedToken] = useState<TokenModel>(tokens[0]);
	const [inputAmount, setInputAmount] = useState<number | string>('');
	const [outputAmount, setOutputAmount] = useState<number | string>('');
	const initialFee = (1 - parseFloat(selectedToken.mintRate && selectedToken.mintRate.toString())).toFixed(3);
	const [fee, setFee] = useState<number | string>(initialFee);
	const _debouncedSetInputAmount = debounce(600, async (val) => {
		setInputAmount(val);
		val = new BigNumber(val);
		if (val.gt(ZERO))
			store.ibBTCStore.calcMintAmount(selectedToken, selectedToken.scale(val), handleCalcOutputAmount);
		else {
			setOutputAmount('');
			setFee(initialFee);
		}
	});

	const handleCalcOutputAmount = (err: any, result: any): void => {
		if (!err) {
			setOutputAmount(ibBTC.unscale(new BigNumber(result[0])).toString(10));
			setFee(ibBTC.unscale(new BigNumber(result[1])).toString(10));
		} else setOutputAmount('');
	};

	const handleInputAmount = (event: any) => {
		const nextValue = event?.target?.value;
		_debouncedSetInputAmount(nextValue);
	};

	const handleTokenSelection = (event: any) => {
		const token = tokens.find((token: TokenModel) => token.symbol === event?.target?.value);
		setSelectedToken(token || tokens[0]);
	};

	const resetState = () => {
		setInputAmount((inputRef.value = ''));
		setOutputAmount('');
		setFee(initialFee);
	};

	const useMaxBalance = () => {
		setInputAmount((inputRef.value = selectedToken.unscale(selectedToken.balance).toString(10)));
		store.ibBTCStore.calcMintAmount(selectedToken, selectedToken.balance, handleCalcOutputAmount);
	};
	const handleMintClick = () => {
		store.ibBTCStore.mint(selectedToken, selectedToken.scale(new BigNumber(inputAmount)), handleMint);
	};

	const handleMint = (err: any, result: any): void => {
		resetState();
	};

	return (
		<Container className={classes.root} maxWidth="lg">
			<div className={classes.outerWrapper}>
				<Typography variant="caption" className={classes.balance}>
					Available {selectedToken.symbol}: {selectedToken.formattedBalance}
				</Typography>
				<div className={classes.inputWrapper}>
					<Tokens tokens={tokens} default={selectedToken.symbol} onTokenSelect={handleTokenSelection} />
					<input
						className={classes.unstylishInput + ' unstylish-input'}
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
				<svg
					className={classes.arrowDown}
					width="13"
					height="18"
					viewBox="0 0 13 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M6.5 15.2138L11.6295 10L13 11.3931L6.5 18L-6.08938e-08 11.3931L1.37054 10L6.5 15.2138Z"
						fill="white"
					/>
					<line x1="6.5" y1="16" x2="6.5" y2="4.37114e-08" stroke="white" strokeWidth="2" />
				</svg>
			</div>
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
						className={classes.unstylishInput + ' unstylish-input'}
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
					<div className={classes.summaryRow}>
						<Typography variant="subtitle1">Current Conversion Rate: </Typography>
						{outputAmount ? (
							<Typography variant="subtitle1">
								{inputAmount} {selectedToken.symbol}: {outputAmount} {ibBTC.symbol}
							</Typography>
						) : (
							<Typography variant="subtitle1">
								1 {selectedToken.symbol}: {selectedToken.mintRate || ''} {ibBTC.symbol}
							</Typography>
						)}
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
				<Button size="large" variant="contained" color="primary" onClick={handleMintClick}>
					MINT
				</Button>
			</div>
		</Container>
	);
});
