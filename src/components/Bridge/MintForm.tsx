import React from 'react';
import { Grid, Button, TextField, Typography } from '@material-ui/core';
import { Token } from 'components/IbBTC/Tokens';
import { ArrowDownward } from '@material-ui/icons';

import { MIN_AMOUNT } from './constants';
import { Slippage } from './Common';

export const MintForm = (props: any) => {
	const {
		classes,
		handleChange,
		handleSetMaxSlippage,
		nextStep,
		values,
		assetSelect,
		itemContainer,
		connectWallet,
	} = props;

	const next = (e: any) => {
		e.preventDefault();
		nextStep();
	};

	return (
		<>
			<Grid container spacing={2} alignItems={'center'} style={{ padding: '.6rem 2rem' }}>
				<Grid item xs={12}>
					<TextField
						variant="outlined"
						size="medium"
						value={values.amount}
						disabled={!!values.connectedAddress === false}
						placeholder="0.00"
						onChange={handleChange('amount')}
						InputProps={{
							style: { fontSize: '3rem' },
							endAdornment: [
								<div>
									<Token token={{ symbol: 'BTC', icon: require('assets/icons/btc.svg') }} />
								</div>,
							],
						}}
					/>
				</Grid>
				<Grid item xs={12}>
					<ArrowDownward />
				</Grid>
				<Grid item xs={12}>
					<Typography variant="body1" color="textSecondary" style={{ textAlign: 'right' }}>
						Balance: {values.token === 'renBTC' ? values.renbtcBalance : values.wbtcBalance}
					</Typography>

					<div className={classes.row}>
						<Typography variant="h1">{values.receiveAmount.toFixed(8) || '0.00'}</Typography>
						{assetSelect()}
					</div>
				</Grid>
				{values.token === 'WBTC' && (
					<Slippage
						values={values}
						classes={classes}
						handleChange={handleChange}
						handleSetMaxSlippage={handleSetMaxSlippage}
					/>
				)}
			</Grid>
			<Grid container spacing={2} alignItems={'center'} style={{ padding: '2rem 0 .5rem' }}>
				<Grid item xs={12} className={classes.summaryWrapper}>
					<div className={classes.summaryRow}>
						<Typography variant="subtitle1">Destination </Typography>
						<Typography variant="body1">{values.shortAddr || '0x...'}</Typography>
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
				<Grid container justify={'center'}>
					{!!values.connectedAddress ? (
						<Button
							variant="contained"
							color="primary"
							className={classes.button}
							onClick={next}
							disabled={(values.amount as number) > MIN_AMOUNT ? false : true}
							size="large"
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
