import React, { useState, useEffect, useContext } from 'react';
import { Grid, Button, Input, TextField, Typography } from '@material-ui/core';
import validate from 'bitcoin-address-validation';
import { Token } from 'components/IbBTC/Tokens';
import { ArrowDownward } from '@material-ui/icons';

import { StoreContext } from 'mobx/store-context';
import BTCLogo from 'assets/icons/btc.svg';
import { MIN_AMOUNT } from './constants';
import { Slippage } from './Common';

export const ReleaseForm = (props: any) => {
	const store = useContext(StoreContext);
	const {
                wallet: { connectedAddress },
		bridge: { renbtcBalance, wbtcBalance },
	} = store;
	const {
		classes,
		handleChange,
		handleSetMaxSlippage,
		nextStep,
		values,
		connectWallet,
		updateState,
		assetSelect,
		itemContainer,
		calcFees,
	} = props;
	const [validAddress, setValidAddress] = useState(false);
	const next = (e: any) => {
		e.preventDefault();
		nextStep();
	};

	const setAmount = (amount: any, token: any) => (event: any) => {
		event.preventDefault();
		updateState('token', token);
		calcFees(amount, 'burnAmount');
	};

	const getSelectedTokenBalance = () => {
		return values.token === 'renBTC' ? renbtcBalance : wbtcBalance;
	};

	useEffect(() => {
		if (validate(values.btcAddr)) {
			setValidAddress(true);
		} else {
			setValidAddress(false);
		}
	}, [values.btcAddr]);

	return (
		<>
			<Grid container spacing={2} style={{ padding: '.6rem 2rem' }}>
				<Grid item xs={12} style={{ marginBottom: '.2rem' }}>
					<Typography variant="body1" color="textSecondary" style={{ textAlign: 'right' }}>
						Balance: {values.token === 'WBTC' ? wbtcBalance : renbtcBalance}
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<TextField
						variant="outlined"
						size="medium"
						value={values.burnAmount}
						disabled={!!connectedAddress === false}
						placeholder="0.00"
						onChange={handleChange('burnAmount')}
						InputProps={{
							style: {
								fontSize: '3rem',
								color: getSelectedTokenBalance() < values.burnAmount ? 'red' : 'inherit',
							},
							endAdornment: [
								<Button
									size="small"
									className={classes.btnMax}
									variant="outlined"
									onClick={(e) => {
										if (values.token === 'renBTC') setAmount(renbtcBalance, 'renBTC')(e);
										else setAmount(wbtcBalance, 'WBTC')(e);
									}}
								>
									max
								</Button>,
								<div>{assetSelect()}</div>,
							],
						}}
					/>
				</Grid>
				<Grid item xs={12}>
					<ArrowDownward />
				</Grid>
				<Grid item xs={12}>
					<TextField
						variant="outlined"
						size="medium"
						value={values.btcAddr}
						disabled={!!connectedAddress === false}
						fullWidth={true}
						error={!validAddress}
						placeholder="Your BTC address"
						onChange={handleChange('btcAddr')}
					/>
				</Grid>
				{values.token === 'WBTC' && (
					<Slippage
						values={values}
						classes={classes}
						handleChange={handleChange}
						handleSetMaxSlippage={handleSetMaxSlippage}
                                                disabled={!!connectedAddress === false}
					/>
				)}
			</Grid>
			<Grid container spacing={2} style={{ padding: '1rem 0 0' }}>
				<Grid item xs={12} className={classes.summaryWrapper}>
					<div className={classes.summaryRow}>
						<Typography variant="subtitle1">You will receive: </Typography>
						<Typography variant="body1">
							<div style={{ display: 'flex', alignItems: 'center' }}>
								<img src={BTCLogo} className={classes.logo2} />
								{values.receiveAmount.toFixed(8)} BTC
							</div>
						</Typography>
					</div>
					{values.token === 'WBTC' && (
						<div className={classes.summaryRow}>
							<Typography variant="subtitle1">Price impact: </Typography>
							<Typography variant="body1">
								{Math.abs(values.estimatedSlippage * 100).toFixed(2) + '%'}
							</Typography>
						</div>
					)}
				</Grid>
			</Grid>
			<Grid container spacing={2} alignItems={'center'} style={{ padding: '.6rem 2rem' }}>
				<Grid item xs={12}>
					{!!connectedAddress ? (
						<Button
							variant="contained"
							color="primary"
							fullWidth
							className={classes.button}
							size="large"
							onClick={next}
							disabled={
								(values.burnAmount as number) > MIN_AMOUNT &&
								getSelectedTokenBalance() >= values.burnAmount &&
								validAddress
									? false
									: true
							}
						>
							Next
						</Button>
					) : (
						<Button
							fullWidth
							size="large"
							variant="contained"
							color="primary"
							className={classes.button}
							onClick={connectWallet}
						>
							Connect
						</Button>
					)}
				</Grid>
			</Grid>
		</>
	);
};
