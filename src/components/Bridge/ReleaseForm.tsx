import { Button, Grid, TextField, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import { ArrowDownward } from '@material-ui/icons';
import BTCLogo from 'assets/icons/btc.svg';
import { MIN_AMOUNT } from './constants';
import { Slippage } from './Common';
import validate from 'bitcoin-address-validation';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const ReleaseForm = ({
	classes,
	handleChange,
	handleSetMaxSlippage,
	nextStep,
	values,
	connectWallet,
	updateState,
	assetSelect,
	calcFees,
}: any) => {
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

	const selectedTokenBalance =
		values.token === 'renBTC'
			? values.renbtcBalance
			: values.token === 'bWBTC'
			? values.bwbtcBalance
			: values.wbtcBalance;

	useEffect(() => {
		if (validate(values.btcAddr)) {
			setValidAddress(true);
		} else {
			setValidAddress(false);
		}
	}, [values.btcAddr]);

	const isWBTC = values.token === 'WBTC' || values.token === 'bWBTC';

	return (
		<>
			<Grid container spacing={2} style={{ padding: '.6rem 2rem' }}>
				<Grid item xs={12} style={{ marginBottom: '.2rem' }}>
					<Typography variant="body1" color="textSecondary" style={{ textAlign: 'right' }}>
						Balance: {selectedTokenBalance}
					</Typography>
				</Grid>

				<Grid item xs={12}>
					<TextField
						variant="outlined"
						size="medium"
						value={values.burnAmount}
						disabled={!!values.connectedAddress === false}
						placeholder="0.00"
						onChange={handleChange('burnAmount')}
						InputProps={{
							style: {
								fontSize: '3rem',
								color: selectedTokenBalance < values.burnAmount ? 'red' : 'inherit',
							},
							endAdornment: [
								// eslint-disable-next-line react/jsx-key
								<Button
									size="small"
									className={classes.btnMax}
									variant="outlined"
									onClick={(e) => {
										if (values.token === 'renBTC') setAmount(values.renbtcBalance, 'renBTC')(e);
										else if (values.token === 'bWBTC') setAmount(values.bwbtcBalance, 'bWBTC')(e);
										else setAmount(values.wbtcBalance, 'WBTC')(e);
									}}
								>
									max
								</Button>,
								// eslint-disable-next-line react/jsx-key
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
						disabled={!!values.connectedAddress === false}
						fullWidth={true}
						error={!validAddress}
						placeholder="Your BTC address"
						onChange={handleChange('btcAddr')}
					/>
				</Grid>

				{isWBTC && (
					<Slippage
						values={values}
						classes={classes}
						handleChange={handleChange}
						handleSetMaxSlippage={handleSetMaxSlippage}
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

					{isWBTC && (
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
					{!!values.connectedAddress ? (
						<Button
							variant="contained"
							color="primary"
							fullWidth
							className={classes.button}
							size="large"
							onClick={next}
							disabled={
								(values.burnAmount as number) > MIN_AMOUNT &&
								selectedTokenBalance >= values.burnAmount &&
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
