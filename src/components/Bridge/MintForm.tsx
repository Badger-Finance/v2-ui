import React from 'react';
import { Grid, Button } from '@material-ui/core';

export const MintForm = (props: any) => {
	const { classes, handleChange, nextStep, values, assetSelect, itemContainer, connectWallet } = props;

	const next = (e: any) => {
		e.preventDefault();
		nextStep();
	};

	return (
		<Grid container alignItems={'center'}>
			<Grid item xs={12}>
				<input
					inputMode="numeric"
					placeholder="0.00 BTC"
					type="text"
					className={classes.amountInput}
					onChange={handleChange('amount')}
					value={values.amount}
					disabled={!!values.connectedAddress === false}
				/>
			</Grid>
			{values.spacer}
			{itemContainer('Receive token', assetSelect())}
			{values.spacer}
			{itemContainer('Destination', values.shortAddr)}
			{values.spacer}
			<Grid item xs={12}>
				<div className={classes.itemContainer}>
					<div>You will receive</div>
					<div className={classes.receiveAmount}>
						<img
							src={values.token === 'WBTC' ? values.WBTCLogo : values.renBTCLogo}
							className={classes.logo2}
						/>
						<div>
							<div>{values.receiveAmount.toFixed(8)}</div>
							<div>{values.token}</div>
						</div>
					</div>
				</div>
			</Grid>
			{values.spacer}
			{values.token === 'WBTC'
				? itemContainer('Price impact', Math.abs(values.estimatedSlippage * 100).toFixed(2) + '%')
				: null}
			<Grid container justify={'center'}>
				{!!values.connectedAddress ? (
					<Button
						variant="contained"
						color="primary"
						className={classes.button}
						onClick={next}
						disabled={(values.amount as number) > values.MIN_AMOUNT ? false : true}
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
