import React, { useContext, useState } from 'react';

import { Container, Button, Typography } from '@material-ui/core';

import { useStyles, debounce } from './common';
import BigNumber from 'bignumber.js';
import { Tokens } from './Tokens';

import { TokenModel } from './model';

import { StoreContext } from '../../mobx/store-context';

export const Mint = (): any => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const tokens = store.bbtcStore.tokens;
	const bBTC = store.bbtcStore.bBTC;

	let inputRef: any;

	const [selectedToken, setSelectedToken] = useState<TokenModel>(tokens[0]);
	const [inputAmount, setInputAmount] = useState<number | string>('');
	const _debouncedSetInputAmount = debounce(1000, (val) => {
		setInputAmount(val);
	});

	const handleInputAmount = (event: any) => {
		const nextValue = event?.target?.value;
		_debouncedSetInputAmount(nextValue);
	};

	const handleTokenSelection = (event: any) => {
		const token = tokens.find((token) => token.symbol === event?.target?.value);
		setSelectedToken(token || tokens[0]);
	};

	const useMaxBalance = () => {
		setInputAmount((inputRef.value = selectedToken.balance.toString(10)));
	};
	const handleMintClick = () => {
		store.bbtcStore.mint(selectedToken, selectedToken.scale(new BigNumber(inputAmount)));
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
					Available {bBTC.symbol}: {bBTC.formattedBalance}
				</Typography>
				<div className={classes.inputWrapper}>
					<div className={classes.token}>
						<img src={bBTC.icon} className={classes.tokenIcon} alt={bBTC.name} />
						<Typography className={classes.tokenLabel} variant="body1">
							{bBTC.symbol}
						</Typography>
					</div>
					<input
						className={classes.unstylishInput + ' unstylish-input'}
						type="number"
						min="0"
						value={inputAmount}
						placeholder="0.0"
						readOnly
					/>
				</div>
			</div>
			<div className={classes.outerWrapper}>
				<div className={classes.summaryWrapper}>
					<div className={classes.summaryRow}>
						<Typography variant="subtitle1">Current Conversion Rate: </Typography>
						<Typography variant="subtitle1">
							1{selectedToken.symbol}: 1{bBTC.symbol}
						</Typography>
					</div>
					<div className={classes.summaryRow}>
						<Typography variant="subtitle1">Fees: </Typography>
						<Typography variant="subtitle1">0.002 {bBTC.symbol}</Typography>
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
};
