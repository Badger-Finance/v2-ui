import React, { useState } from 'react';
import { Grid, Button, Checkbox, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

export const ConfirmForm = (props: any) => {
	const { classes, confirmStep, previousStep, values, shortenAddress, itemContainer } = props;
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
			return values.BTCLogo
		} else {
			return values.token === 'WBTC' ? values.WBTCLogo : values.renBTCLogo
		}
	}

	const handleCheckbox = (event: any) => {
		const name = event.target.name;
		const value = event.target.checked;
		console.log(name, value);
		setAgreement((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	return (
		<Grid container alignItems={'center'}>
			<Grid item xs={4}>
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
						<img
							src={values.token === 'WBTC' ? values.WBTCLogo : values.renBTCLogo}
							className={classes.logo2}
						/>
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
				<div className={classes.itemContainer}>
					<div className={classes.info}>
						<div>RenVM Fee</div>
						<div style={{ paddingLeft: '10px' }}>
							<Tooltip
								title={`RenVM takes a ${values.renvmMintFee * 100}% fee per mint transaction and ${
									values.renvmBurnFee * 100
								}% per burn transaction. This is shared evenly between all active nodes in the decentralized network.`}
							>
								<InfoIcon fontSize={'small'} />
							</Tooltip>
						</div>
					</div>
					<div>{`${values.renFee} BTC`}</div>
				</div>
				<div className={classes.itemContainer}>
					<div className={classes.info}>
						<div>Badger Fee</div>
						<div style={{ paddingLeft: '10px' }}>
							<Tooltip
								title={`Badger takes a ${values.badgerMintFee * 100}% fee per mint transaction and ${
									values.badgerBurnFee * 100
								}% per burn transaction.`}
							>
								<InfoIcon fontSize={'small'} />
							</Tooltip>
						</div>
					</div>
					<div>{`${values.badgerFee} BTC`}</div>
				</div>
				<div className={classes.itemContainer}>
					<div className={classes.info}>
						<div>Bitcoin Miner Fee</div>
						<div style={{ paddingLeft: '10px' }}>
							<Tooltip
								title={
									'The fee required by Bitcoin miners, to move BTC. This does not go RenVM, the Ren or Badger team.'
								}
							>
								<InfoIcon fontSize={'small'} />
							</Tooltip>
						</div>
					</div>
					<div>{`${values.networkFee} BTC`}</div>
				</div>
			</Grid>
			{values.spacer}
			<Grid item xs={12}>
				<div className={classes.itemContainer}>
					<div>You will receive</div>
					<div className={classes.receiveAmount}>
						<img
							src={receiveLogo()}
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
