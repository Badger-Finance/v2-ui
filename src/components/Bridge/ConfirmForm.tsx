import React, { useState, useContext } from 'react';
import { Grid, Button, Checkbox, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

import { StoreContext } from 'mobx/store-context';
import { shortenAddress } from 'utils/componentHelpers';
import renBTCLogo from 'assets/icons/renBTC.svg';
import WBTCLogo from 'assets/icons/WBTC.svg';

export const ConfirmForm = (props: any) => {
        const store = useContext(StoreContext);
        const {
                bridge: {
                        renvmMintFee,
                        renvmBurnFee,
                        badgerBurnFee,
                        badgerMintFee,
                        lockNetworkFee,
                        releaseNetworkFee,
                }
        } = store;
	const { classes, confirmStep, previousStep, values, itemContainer } = props;
	const [agreement, setAgreement] = useState({
		ethRequired: false,
		userError: false,
	});

	const back = (e: any) => {
		e.preventDefault();
		previousStep();
	};
	const confirm = (e: any) => {
		e.preventDefault();
		confirmStep();
	};

	const receiveLogo = () => {
		if (values.tabValue == 1) {
			return values.BTCLogo;
		} else {
			return values.token === 'WBTC' ? WBTCLogo : renBTCLogo;
		}
	};

	const handleCheckbox = (event: any) => {
		const name = event.target.name;
		const value = event.target.checked;
		setAgreement((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const feeContainer = (title: string, message: string, value: string) => {
		return (
			<div className={classes.itemContainer}>
				<div className={classes.info}>
					<div>{title}</div>
					<div style={{ paddingLeft: '10px' }}>
						<Tooltip title={message}>
							<InfoIcon fontSize={'small'} />
						</Tooltip>
					</div>
				</div>
				<div>{value}</div>
			</div>
		);
	};

	return (
		<Grid container alignItems={'center'}>
			<Grid item xs={4} style={{ padding: '1rem 0rem' }}>
				<Button variant="contained" size={'small'} color="primary" onClick={back}>
					BACK
				</Button>
			</Grid>
			<Grid item xs={12}>
				<h3>{values.tabValue == 0 ? 'MINTING' : 'RELEASING'}</h3>
			</Grid>
			{values.spacer}
			<Grid item xs={12}>
				<input
					inputMode="numeric"
					type="text"
					className={classes.amountInput}
					disabled={true}
					value={values.tabValue == 0 ? `${values.amount} BTC` : `${values.burnAmount} ${values.token}`}
				/>
			</Grid>
			{values.spacer}
			<Grid item xs={12}>
				<div className={classes.itemContainer}>
					<div>{values.tabValue == 0 ? 'Minting' : 'Releasing'}</div>
					<div className={classes.receiveAmount}>
						<img src={values.token === 'WBTC' ? WBTCLogo : renBTCLogo} className={classes.logo2} />
						<div>
							<div>{values.token}</div>
						</div>
					</div>
				</div>
			</Grid>

			{values.spacer}
			{itemContainer('Destination', values.tabValue == 0 ? values.shortAddr : shortenAddress(values.btcAddr))}
			{values.spacer}
			<Grid item xs={12}>
				{feeContainer(
					'RenVM Fee',
					`RenVM takes a ${renvmMintFee * 100}% fee per mint transaction and ${
						renvmBurnFee * 100
					}% per burn transaction. This is shared evenly between all active nodes in the decentralized network.`,
					`${values.renFee.toFixed(8)} BTC`,
				)}
				{feeContainer(
					'Badger Fee',
					`Badger takes a ${badgerMintFee * 100}% fee per mint transaction and ${
						badgerBurnFee * 100
					}% per burn transaction.`,
					`${values.badgerFee.toFixed(8)} BTC`,
				)}
				{feeContainer(
					'Bitcoin Miner Fee',
					'This fee is paid to Bitcoin miners to move BTC. This does not go to the Ren or Badger team.',
					`${values.tabValue == 0 ? lockNetworkFee : releaseNetworkFee} BTC`,
				)}
				{values.token === 'WBTC' && feeContainer(
					'Price Impact of Swap',
					'The estimated slippage due to swapping RenBTC <-> wBTC.',
					`${Math.abs(values.estimatedSlippage * 100).toFixed(2) + '%'}`,
				)}
				{values.token === 'WBTC' && feeContainer(
					'Max Slippage',
					'User determined maximum acceptable slippage for swapped renBTC <-> wBTC. If slippage is too high, the swap will fail.',
					`${Math.abs(parseFloat(values.maxSlippage)).toFixed(2) + '%'}`,
				)}
			</Grid>
			{values.spacer}
			<Grid item xs={12}>
				<div className={classes.itemContainer}>
					<div>You will receive</div>
					<div className={classes.receiveAmount}>
						<img src={receiveLogo()} className={classes.logo2} />
						<div>
							<div>{values.receiveAmount.toFixed(8)}</div>
							<div>{values.token}</div>
						</div>
					</div>
				</div>
			</Grid>
			{values.spacer}
			{values.tabValue === 0 ? (
				<Grid item xs={12}>
					<div className={classes.checkboxContainer}>
						<div>
							<Checkbox
								checked={agreement.ethRequired}
								onChange={handleCheckbox}
								name={'ethRequired'}
								color="primary"
							/>{' '}
						</div>
						<div>
							I acknowledge this transaction requires ETH and that user errors such as sending funds to
							the wrong address or attempting multiple deposits with multiple transactions can result in
							lost funds
						</div>
					</div>
					{values.spacer}
					<div className={classes.checkboxContainer}>
						<div>
							<Checkbox
								checked={agreement.userError}
								onChange={handleCheckbox}
								name={'userError'}
								color="primary"
							/>{' '}
						</div>
						<div>
							I acknowledge that the Bitcoin Gateway address in the next screen can only be used once and
							is valid only for 24 hours.
						</div>
					</div>
				</Grid>
			) : null}
			{values.spacer}
			<Grid container justify={'center'}>
				<Button
					variant="contained"
					color="primary"
					className={classes.button}
					disabled={values.tabValue === 0 && !Object.values(agreement).every(Boolean) ? true : false}
					onClick={confirm}
				>
					CONFIRM
				</Button>
			</Grid>
		</Grid>
	);
};
