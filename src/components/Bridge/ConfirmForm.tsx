import React, { useState, useContext } from 'react';
import { Grid, Button, Checkbox, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { StoreContext } from 'mobx/store-context';

import { shortenAddress } from 'utils/componentHelpers';

const btcLogo = '/assets/icons/btc.svg';
const WBTCLogo = '/assets/icons/wbtc.svg';
const byvWBTCLogo = '/assets/icons/byvwbtc.svg';
const renBTCLogo = '/assets/icons/renbtc.svg';
const crvBTCLogo = '/assets/tokens/bcrvrenwbtc.png';

interface ConfirmFormProps {
	values: any;
	handleChange: (name: string) => (event: any) => Promise<void>;
	previousStep: () => void;
	confirmStep: () => void;
	classes: any;
	itemContainer: (label: string, item: any) => JSX.Element;
}

export const ConfirmForm = ({
	classes,
	confirmStep,
	previousStep,
	values,
	itemContainer,
}: ConfirmFormProps): JSX.Element => {
	const store = useContext(StoreContext);
	const {
		bridge: {
			renvmMintFee,
			renvmBurnFee,
			badgerBurnFee,
			badgerMintFee,
			lockNetworkFee,
			releaseNetworkFee,
			shortAddr,
		},
		wallet: { gasPrices },
		uiState: { gasPrice },
	} = store;

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

	const handleCheckbox = (event: any) => {
		const name = event.target.name;
		const value = event.target.checked;
		setAgreement((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const feeContainer = (title: string, message: string, value: string | JSX.Element) => {
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

	const selectedTokenImage = () => {
		switch (values.token) {
			case 'renBTC':
				return renBTCLogo;
			case 'byvWBTC':
				return byvWBTCLogo;
			case 'WBTC':
				return WBTCLogo;
			case 'bCRVrenBTC':
				return crvBTCLogo;
			case 'bCRVsBTC':
				return crvBTCLogo;
			case 'bCRVtBTC':
				return crvBTCLogo;
			default:
				return renBTCLogo;
		}
	};

	// Estimated units of gas required to mint each of the following.
	// These values were taken from a sample of already processed txes.
	// TODO: These need to be recorded for non ETH networks as well when
	// bridge expands to other networks.
	const estimatedGasUnitsETH = (): number => {
		switch (values.token) {
			case 'renBTC':
				return 210000;
			case 'WBTC':
				return 550000;
			case 'byvWBTC':
				return 650000;
			case 'bCRVrenBTC':
			case 'bCRVsBTC':
				return 500000;
			case 'bCRVtBTC':
				return 600000;
			default:
				return 0;
		}
	};

	const isWBTC = ['byvWBTC', 'WBTC'].indexOf(values.token) >= 0;

	const isVault = ['byvWBTC', 'bCRVrenBTC', 'bCRVsBTC', 'bCRVtBTC'].indexOf(values.token) >= 0;

	return (
		<Grid container alignItems={'center'}>
			<Grid item xs={4} style={{ padding: '1rem 0rem' }}>
				<Button variant="contained" size={'small'} color="primary" onClick={back}>
					BACK
				</Button>
			</Grid>

			<Grid item xs={12}>
				<h3>{values.tabValue <= 1 ? 'MINTING' : 'RELEASING'}</h3>
			</Grid>

			{values.spacer}

			<Grid item xs={12}>
				<input
					inputMode="numeric"
					type="text"
					className={classes.amountInput}
					disabled={true}
					value={values.tabValue <= 1 ? `${values.amount} BTC` : `${values.burnAmount} ${values.token}`}
				/>
			</Grid>

			{values.spacer}

			<Grid item xs={12}>
				{values.tabValue <= 1 && values.token === 'byvWBTC' && (
					<>
						{feeContainer(
							'Minting',
							`By minting byvWBTC, this transaction directly deposits your newly minted wBTC into the Badger wBTC vault. byvWBTC represents your position in the vault.`,
							<div className={classes.receiveAmount}>
								<img src={selectedTokenImage()} className={classes.logo2} />
								<div>
									<div>{values.token}</div>
								</div>
							</div>,
						)}
					</>
				)}

				{!(values.tabValue <= 1 && values.token === 'byvWBTC') && (
					<div className={classes.itemContainer}>
						<div>{values.tabValue <= 1 ? 'Minting' : 'Releasing'}</div>

						<div className={classes.receiveAmount}>
							<img src={selectedTokenImage()} className={classes.logo2} />
							<div>
								<div>{values.token}</div>
							</div>
						</div>
					</div>
				)}
			</Grid>

			{values.spacer}

			{itemContainer('Destination', values.tabValue == 0 ? shortAddr : shortenAddress(values.btcAddr))}

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
					`${values.tabValue <= 1 ? lockNetworkFee : releaseNetworkFee} BTC`,
				)}

				{values.tabValue <= 1 &&
					feeContainer(
						'Estimated Gas Fee',
						'This estimated network fee that goes to the destination network. This does not go to the Ren or Badger team.',
						`${(estimatedGasUnitsETH() * gasPrices[gasPrice]) / 1e9} ETH`,
					)}
				{isWBTC && (
					<>
						{feeContainer(
							'Price Impact of Swap',
							'The estimated slippage due to swapping renBTC to/from wBTC.',
							`${Math.abs(values.estimatedSlippage * 100).toFixed(2) + '%'}`,
						)}
						{feeContainer(
							'Max Slippage',
							'User determined maximum acceptable slippage for swapped renBTC to/from wBTC. If slippage is too high, the swap will fail.',
							`${Math.abs(parseFloat(values.maxSlippage)).toFixed(2) + '%'}`,
						)}
					</>
				)}
			</Grid>
			{values.spacer}

			<Grid item xs={12}>
				<div className={classes.itemContainer}>
					<div>You will receive {isVault ? '(approximately)' : ''}</div>
					<div className={classes.receiveAmount}>
						<img src={values.tabValue == 2 ? btcLogo : selectedTokenImage()} className={classes.logo2} />

						<div>
							<div>{values.receiveAmount.toFixed(8)}</div>
							<div>{values.tabValue == 2 ? 'BTC' : values.token}</div>
						</div>
					</div>
				</div>
			</Grid>

			{values.spacer}
			{values.tabValue <= 1 ? (
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
					disabled={values.tabValue <= 1 && !Object.values(agreement).every(Boolean) ? true : false}
					onClick={confirm}
				>
					CONFIRM
				</Button>
			</Grid>
		</Grid>
	);
};
