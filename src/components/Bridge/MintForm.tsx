import React, { useContext } from 'react';
import { Grid, Button, TextField, Typography } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ArrowDownward } from '@material-ui/icons';

import { Token } from 'components/IbBTC/Tokens';
import { StoreContext } from 'mobx/store-context';
import { MIN_AMOUNT } from './constants';
import { Slippage, ValuesProp } from './Common';

interface MintFormProps {
	values: ValuesProp;
	handleChange(name: string): (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
	handleSetMaxSlippage: (name: string) => () => void;
	previousStep: () => void;
	nextStep: () => void;
	classes: ClassNameMap;
	assetSelect: () => JSX.Element;
	connectWallet: () => Promise<void>;
	isEarn: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const MintForm = ({
	classes,
	handleChange,
	handleSetMaxSlippage,
	nextStep,
	values,
	assetSelect,
	connectWallet,
	isEarn,
}: MintFormProps): JSX.Element => {
	const store = useContext(StoreContext);

	const {
		wallet: { connectedAddress },
		bridge: { renbtcBalance, wbtcBalance, bwbtcBalance, shortAddr },
	} = store;

	const next = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		nextStep();
	};

	const isWBTC = values.token === 'WBTC' || values.token === 'bWBTC';

	const selectedTokenBalance =
		values.token === 'renBTC' ? renbtcBalance : values.token === 'bWBTC' ? bwbtcBalance : wbtcBalance;

	return (
		<>
			<Grid container spacing={2} alignItems={'center'} style={{ padding: '.6rem 2rem' }}>
				{isEarn && (
					<Grid item xs={12}>
						<Typography variant="body1" color="textPrimary" align="left">
							Mint & Earn deposits your BTC into the selected vault which starts earning more BTC for you
							passively
						</Typography>
					</Grid>
				)}

				{values.spacer}

				<Grid item xs={12}>
					<TextField
						variant="outlined"
						size="medium"
						value={values.amount}
						disabled={!!connectedAddress === false}
						placeholder="0.00"
						onChange={handleChange('amount')}
						InputProps={{
							style: { fontSize: '3rem' },
							endAdornment: [
								<div key="btc">
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
						Balance: {selectedTokenBalance}
					</Typography>

					<div className={classes.row}>
						<Typography variant="h1">{values.receiveAmount.toFixed(8) || '0.00'}</Typography>
						{assetSelect()}
					</div>
				</Grid>

				{isWBTC && (
					<Slippage
						values={values}
						classes={classes}
						handleChange={handleChange}
						handleSetMaxSlippage={handleSetMaxSlippage}
						disabled={!!connectedAddress === false}
					/>
				)}
			</Grid>

			<Grid container spacing={2} alignItems={'center'} style={{ padding: '2rem 0 .5rem' }}>
				<Grid item xs={12} className={classes.summaryWrapper}>
					<div className={classes.summaryRow}>
						<Typography variant="subtitle1">Destination: </Typography>
						<Typography variant="body1">{shortAddr || '0x...'}</Typography>
					</div>

					{isEarn && (
						<div className={classes.summaryRow}>
							<Typography variant="subtitle1">APY: </Typography>
							<Typography variant="body1">12.52% (Temp)</Typography>
						</div>
					)}

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
				<Grid container justify={'center'}>
					{!!connectedAddress ? (
						<Button
							variant="contained"
							color="primary"
							className={classes.button}
							onClick={next}
							disabled={parseFloat(values.amount) > MIN_AMOUNT ? false : true}
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
