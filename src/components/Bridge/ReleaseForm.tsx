import React, { useState, useEffect } from 'react';
import { Grid, Button, Input } from '@material-ui/core';
import validate from 'bitcoin-address-validation';

export const ReleaseForm = (props: any) => {
	const {
		classes,
		handleChange,
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
		return values.token === 'renBTC' ? values.renbtcBalance : values.wbtcBalance;
	};

	useEffect(() => {
		if (validate(values.btcAddr)) {
			setValidAddress(true);
		} else {
			setValidAddress(false);
		}
	}, [values.btcAddr]);

	return (
		<Grid container alignItems={'center'}>
			<Grid item xs={12}>
				<input
					inputMode="numeric"
					style={
						getSelectedTokenBalance() < values.burnAmount
							? {
									color: 'red',
							  }
							: {}
					}
					placeholder={`0.00 ${values.token}`}
					type="text"
					className={classes.amountInput}
					onChange={handleChange('burnAmount')}
					value={values.burnAmount}
				/>
			</Grid>
			{values.spacer}
			{itemContainer(
				'renBTC balance',
				<Button size="small" color="primary" onClick={setAmount(values.renbtcBalance, 'renBTC')}>
					{values.renbtcBalance}
				</Button>,
			)}
			{itemContainer(
				'WBTC balance',
				<Button size="small" color="primary" onClick={setAmount(values.wbtcBalance, 'WBTC')}>
					{values.wbtcBalance}
				</Button>,
			)}

			{values.spacer}
			{itemContainer('Receive token', assetSelect())}
			{values.spacer}
			{itemContainer(
				'Your BTC Address',
				<Input
					className={classes.btcInput}
					type="text"
					error={!validAddress}
					fullWidth={true}
					onChange={handleChange('btcAddr')}
					value={values.btcAddr}
				/>,
			)}
			{values.spacer}
			<Grid item xs={12}>
				<div className={classes.itemContainer}>
					<div>You will receive</div>
					<div className={classes.receiveAmount}>
						<img src={values.BTCLogo} className={classes.logo2} />
						<div>
							<div>{values.receiveAmount.toFixed(8)}</div>
							<div>BTC</div>
						</div>
					</div>
				</div>
			</Grid>
			{values.spacer}
			{values.token === 'WBTC'
				? itemContainer('Price impact', Math.abs(values.estimatedSlippage * 100).toFixed(2) + '%')
				: null}
			{values.spacer}
			<Grid container justify={'center'}>
				{!!values.connectedAddress ? (
					<Button
						variant="contained"
						color="primary"
						className={classes.button}
						onClick={next}
						disabled={
							(values.burnAmount as number) > values.MIN_AMOUNT &&
							getSelectedTokenBalance() >= values.burnAmount &&
							validAddress
								? false
								: true
						}
					>
						Next
					</Button>
				) : (
					<Button variant="contained" color="primary" className={classes.button} onClick={connectWallet}>
						Connect
					</Button>
				)}
			</Grid>
		</Grid>
	);
};
