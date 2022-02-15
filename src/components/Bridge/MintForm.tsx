import React, { useContext } from 'react';
import { Grid, Button, TextField, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ArrowDownward } from '@material-ui/icons';
import { toJS } from 'mobx';
import { StoreContext } from 'mobx/store-context';
import { MIN_AMOUNT } from './constants';
import { Slippage, ValuesProp } from './Common';
import { sett_system } from 'config/deployments/mainnet.json';
import { VaultMap } from '../../mobx/model/vaults/vault-map';
import { shortenAddress } from 'utils/componentHelpers';

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
		onboard,
		vaults: { settMap },
	} = store;

	const next = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		nextStep();
	};

	const isWBTC = values.token === 'WBTC' || values.token === 'byvWBTC';

	const getAPY = (token: string, settMap: VaultMap | null | undefined): number => {
		if (!settMap) {
			return 0;
		}
		let address = '';
		switch (token) {
			case 'byvWBTC':
				address = sett_system.vaults['yearn.wBtc'];
				break;
			case 'bCRVrenBTC':
				address = sett_system.vaults['native.renCrv'];
				break;
			case 'bCRVsBTC':
				address = sett_system.vaults['native.sbtcCrv'];
				break;
			case 'bCRVtBTC':
				address = sett_system.vaults['native.tbtcCrv'];
				break;
		}
		// No APY for non vault tokens.
		if (!address) return 0;
		const vault = settMap[address];
		return vault ? vault.apr : 0;
	};

	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
	const displayAddress = onboard.address && isSmallScreen ? shortenAddress(onboard.address) : onboard.address;
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
						disabled={onboard.isActive() === false}
						placeholder="0.00"
						onChange={handleChange('amount')}
						style={{ width: '100%' }}
						InputProps={{
							style: { fontSize: '3rem' },
							endAdornment: [
								<div key="btc">
									<img
										className={classes.tokenIcon}
										src={`/assets/icons/btc-ethereum.svg`}
										alt="bitcoin icon"
									/>
									<Typography variant="body1" component="div">
										BTC
									</Typography>
								</div>,
							],
						}}
					/>
				</Grid>

				<Grid item xs={12}>
					<ArrowDownward />
				</Grid>

				<Grid item xs={12}>
					<div className={`${classes.row} ${classes.longText}`}>
						<Typography variant="h1" className={classes.receiveAmountHeading}>
							{values.receiveAmount.toFixed(8) || '0.00'}
						</Typography>
						{assetSelect()}
					</div>
				</Grid>

				{isWBTC && (
					<Slippage
						values={values}
						classes={classes}
						handleChange={handleChange}
						handleSetMaxSlippage={handleSetMaxSlippage}
						disabled={onboard.isActive() === false}
					/>
				)}
			</Grid>

			<Grid container spacing={2} alignItems={'center'} style={{ padding: '2rem 0 .5rem' }}>
				<Grid item xs={12} className={classes.summaryWrapper}>
					<div className={`${classes.summaryRow} ${classes.longText}`}>
						<Typography variant="subtitle1">Destination: </Typography>
						<Typography variant="body1">{displayAddress || '0x...'}</Typography>
					</div>

					{isEarn && (
						<div className={classes.summaryRow}>
							<Typography variant="subtitle1">ROI: </Typography>
							<Typography variant="body1">
								{getAPY(values.token, toJS(settMap)).toFixed(2) + '%'}
							</Typography>
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
				<Grid container justifyContent={'center'}>
					{onboard.isActive() ? (
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
