import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GatewayJS from '@renproject/gateway';
import Web3 from 'web3';
import async, { any } from 'async';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Grid, Tabs, Tab, FormControl, Select, MenuItem } from '@material-ui/core';
import { MintForm } from './MintForm';
import { ReleaseForm } from './ReleaseForm';
import { ConfirmForm } from './ConfirmForm';
import { SuccessForm } from './SuccessForm';
import { ResumeForm } from './ResumeForm';

import renBTCLogo from '../../assets/icons/renBTC.svg';
import WBTCLogo from '../../assets/icons/WBTC.svg';
import BTCLogo from '../../assets/icons/btc.svg';
import BigNumber from 'bignumber.js';
import { ERC20, BADGER_ADAPTER, CURVE_EXCHANGE, BTC_GATEWAY } from '../../config/constants';
import {
        // TODO: This is just a placeholder address, configure real adapter address once deployed.
        BRIDGE_ADDR,
        CURVE_WBTC_RENBTC_TRADING_PAIR_ADDR,
        WBTC_TOKEN_ADDR,
        RENBTC_TOKEN_ADDR,
        RENVM_GATEWAY_ADDR,
} from '../../config/system/bridge.json';

const MAX_BTC = new BigNumber(2100000000000000);
const MIN_AMOUNT = 0.002;
// SLIPPAGE_BUFFER increases estimated max slippage by 3%.
const SLIPPAGE_BUFFER = 0.03;

const TabPanel = (props: any) => {
	const { children, value, index, ...other } = props;
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <div>{children}</div>}
		</div>
	);
};

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired,
};

const a11yProps = (index: number) => {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
};

// FIXME: renbtc allowance increased popup bug

export const BridgeForm = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = props.classes;
	const spacer = <div className={classes.before} />;

	const {
		wallet: { connect, connectedAddress, provider, onboard },
		contracts: { getAllowance, increaseAllowance },
		uiState: { queueNotification, txStatus, setTxStatus },
		transactions: { updateTx, removeTx, incompleteTransfer },
	} = store;

	// Initial state value that should be reset to initial values on reset.
	const initialStateResettable = {
		amount: '',
		receiveAmount: 0,
		mintReceiveAmount: 0,
		releaseReceiveAmount: 0,
		estimatedSlippage: 0,
		feeAmount: 0.0025,
		burnAmount: '',
		btcAddr: '',
		message: '',
		error: '',
		step: 1,
	};

	const intialState = {
		...initialStateResettable,
		token: 'renBTC',
		renbtcBalance: 0,
		wbtcBalance: 0,
		bridgeAddress: BRIDGE_ADDR,
		shortAddr: '',
		badgerBurnFee: 0,
		badgerMintFee: 0,
		renvmBurnFee: 0,
		renvmMintFee: 0,
		renFee: 0,
		badgerFee: 0,
		networkFee: 0.001, // static fee until we find the api to get it dynamically
		tabValue: 0, // Keep on same tab even after reset
	};
	const [states, setStates] = useState(intialState);
	const slippage = 0.99; // 1%

	const {
		token,
		amount,
		receiveAmount,
		step,
		renbtcBalance,
		wbtcBalance,
		message,
		error,
		burnAmount,
		btcAddr,
		shortAddr,
		feeAmount,
		tabValue,
		estimatedSlippage,
		badgerBurnFee,
		badgerMintFee,
		renvmBurnFee,
		renvmMintFee,
		bridgeAddress,
		renFee,
		badgerFee,
		networkFee,
	} = states;
	const values = {
		token,
		amount,
		receiveAmount,
		step,
		renbtcBalance,
		wbtcBalance,
		message,
		error,
		burnAmount,
		btcAddr,
		provider,
		connectedAddress,
		shortAddr,
		feeAmount,
		tabValue,
		renBTCLogo,
		WBTCLogo,
		BTCLogo,
		spacer,
		MIN_AMOUNT,
		estimatedSlippage,
		badgerBurnFee,
		badgerMintFee,
		renvmBurnFee,
		renvmMintFee,
		renFee,
		badgerFee,
		networkFee,
		bridgeAddress
	};

	const gatewayJS = new GatewayJS('mainnet');

	const web3 = new Web3(provider);
	const adapterContract = new web3.eth.Contract(BADGER_ADAPTER, bridgeAddress);
	const renbtcToken = new web3.eth.Contract(ERC20.abi as any, RENBTC_TOKEN_ADDR);
	const wbtcToken = new web3.eth.Contract(ERC20.abi as any, WBTC_TOKEN_ADDR);
	const gatewayContract = new web3.eth.Contract(BTC_GATEWAY, RENVM_GATEWAY_ADDR);

	const connectWallet = async () => {
		if (!(await onboard.walletSelect())) return;
		const readyToTransact = await onboard.walletCheck();
		if (readyToTransact) {
			connect(onboard);
		}
	};

	const handleTabChange = (event: any, newValue: number) => {
		setStates((prevState) => ({
			...prevState,
			tabValue: newValue,
		}));
	};

	const resetState = () => {
		// Reset everything except balances
		setStates((prevState) => ({
			...prevState,
			...initialStateResettable,
		}));
	};

	const nextStep = () => {
		setStates((prevState) => ({
			...prevState,
			step: prevState.step + 1,
		}));
	};
	const previousStep = () => {
		setStates((prevState) => ({
			...prevState,
			step: prevState.step - 1,
		}));
	};

	const confirmStep = () => {
		if (tabValue === 0) {
			deposit();
		} else if (tabValue === 1) {
			// withdraw()
			approveAndWithdraw()
				.then((result: any) => {
					console.log('SUCCESS APPROVE AND WITHDRAW', result);
				})
				.catch((error: any) => {
					console.error('APPROVEWITHDRAW ERROR', error);
				});
		}
	};

	const updateState = (name: any, value: any) => {
		setStates((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const shortenAddress = (address: String) => {
		return address.slice(0, 6) + '...' + address.slice(address.length - 6, address.length);
	};

	const getFeesFromContract = () => {
		if (!connectedAddress) {
			return;
		}
		adapterContract.methods
			.burnFeeBps()
			.call()
			.then((result: number) => {
				updateState('badgerBurnFee', result / 10000);
			});
		adapterContract.methods
			.mintFeeBps()
			.call()
			.then((result: number) => {
				updateState('badgerMintFee', result / 10000);
			});
		gatewayContract.methods
			.burnFee()
			.call()
			.then((result: number) => {
				updateState('renvmBurnFee', result / 10000);
			});
		gatewayContract.methods
			.mintFee()
			.call()
			.then((result: number) => {
				updateState('renvmMintFee', result / 10000);
			});
	};

	const updateBalance = async () => {
		if (!connectedAddress) {
			return;
		}
		const renbtc_Balance = await renbtcToken.methods.balanceOf(connectedAddress).call();
		const wbtc_Balance = await wbtcToken.methods.balanceOf(connectedAddress).call();

		setStates((prevState) => ({
			...prevState,
			renbtcBalance: parseInt(renbtc_Balance.toString()) / 10 ** 8,
			wbtcBalance: parseInt(wbtc_Balance.toString()) / 10 ** 8,
		}));
	};

	useEffect(() => {
                console.log('There is incomplete Transfer');
	}, [incompleteTransfer]);

	useEffect(() => {
		setStates((prevState) => ({
			...prevState,
			receiveAmount: 0,
			burnAmount: '',
			amount: '',
		}));
	}, [tabValue]);

	useEffect(() => {
		// Reset to original state if we're disconnected in middle
		// of transaction.
		if (!connectedAddress && step !== 1) {
			resetState();
			return;
		}

		if (connectedAddress) {
			setStates((prevState) => ({
				...prevState,
				shortAddr: shortenAddress(connectedAddress),
			}));
		}
		getFeesFromContract();
		updateBalance();
		setInterval(() => {
			updateBalance();
		}, 30 * 1000);
	}, [connectedAddress, shortAddr]);

	const deposit = async () => {
		const amountSats = Math.floor(parseFloat(amount) * 10 ** 8); // Convert to Satoshis)
		let trade: any = null;
		let result: any;
		let commited: boolean = false;
		let completed: boolean = false;
		const contractFn: string = 'mint';
		let maxSlippage = 0;
		let desiredToken = RENBTC_TOKEN_ADDR;
		if (token === 'WBTC') {
			maxSlippage = Math.min(estimatedSlippage * SLIPPAGE_BUFFER, 1);
			desiredToken = WBTC_TOKEN_ADDR
		}
		const params: any = [
			{
				name: '_token',
				type: 'address',
				value: desiredToken,
			},
			{
				name: '_slippage',
				type: 'uint256',
				value: maxSlippage,
			},
			{
				name: '_destination',
				type: 'address',
				value: connectedAddress,
			},
		];

		try {
			result = await gatewayJS
				.open({
					sendToken: GatewayJS.Tokens.BTC.Btc2Eth,
					suggestedAmount: amountSats,
					sendTo: bridgeAddress,
					contractFn: contractFn,
					nonce: GatewayJS.utils.randomNonce(),
					contractParams: params,
					web3Provider: web3.currentProvider,
				})
				.result()
				.on('status', async (status: any) => {
					console.info(`[MINT STATUS] ${status}`);
					if (status === 'mint_returnedFromRenVM') {
						queueNotification(
							'BTC deposit is ready, please sign the transaction to submit to ethereum',
							'info',
						);
					}
				})
				.on('transferUpdated', (transfer: any) => {
					console.info(`[MINT TRANSFER]`, transfer);
					trade = transfer;
					switch (transfer.status) {
						case 'mint_committed':
							if (commited) return;
							updateTx(connectedAddress, transfer);
							commited = true;
						case 'mint_confirmedOnEthereum':
							if (completed) return;
							updateTx(connectedAddress, transfer);
							completed = true;
						default:
							updateTx(connectedAddress, transfer);
					}
				})
				.catch((error: any) => {
					if (error.message !== 'Transfer cancelled by user') {
						console.error(error.message);
						return;
					}
					if (!trade) return;
					removeTx(trade);
					queueNotification('Transfer cancelled by user', 'error');
					resetState();
				});
			// [MINT STATUS] mint_returnedFromRenVM // notifiy user need to take action
			// [MINT STATUS] mint_submittedToEthereum // submited
			// [MINT STATUS] mint_confirmedOnEthereum
			if (!trade) return;
			if (trade.status === 'mint_confirmedOnEthereum') {
				queueNotification('Mint is successful', 'success');
				console.log(`SUCCESSFUL MINT ${result}`);
				console.log(`Deposited ${amount} BTC.`);
				removeTx(trade);
				nextStep();
			}
		} catch (error) {
			// Handle error
			console.error(error);
		}
	};

	const approveAndWithdraw = async () => {
		let methodSeries: any = [];
		const contractFn: any = 'burn';
		const amountSats = Math.floor((burnAmount as any) * 10 ** 8);
		let burnToken = RENBTC_TOKEN_ADDR;
		let maxSlippage = 0;
		if (token === 'WBTC') {
                        // TODO: Calculate and subtract exact fees, for now just hard code 5% in fees.
			burnToken = WBTC_TOKEN_ADDR;
			// const amountSatsWithSlippage = (
			// 	amountSats *
			// 	0.95 *
			// 	(1 - Math.min(estimatedSlippage * SLIPPAGE_BUFFER, 1))
			// ).toFixed(0);
			maxSlippage = Math.min(estimatedSlippage * SLIPPAGE_BUFFER, 1);
		}
		const params: any = [
			{
				name: '_token',
				type: 'address',
				value: burnToken,
			},
			{
				name: '_slippage',
				type: 'uint256',
				value: maxSlippage,
			},
			{
				type: 'bytes',
				name: '_to',
				value: '0x' + Buffer.from(btcAddr).toString('hex'),
				// value: Buffer.from(btcAddr).toString('hex'),
			},
			{
				name: '_amount',
				type: 'uint256',
				value: amountSats,
			},
		];

		const tokenParm = {
			address: token === 'renBTC' ? RENBTC_TOKEN_ADDR : WBTC_TOKEN_ADDR,
			symbol: token,
			totalSupply: amountSats,
		};

		const allowance: number = await new Promise((resolve, reject) => {
			getAllowance(tokenParm, bridgeAddress, (err: any, result: number) => {
				if (err) reject(err);
				resolve(result);
			});
		});
		if (amountSats > allowance) {
			methodSeries.push((callback: any) => increaseAllowance(tokenParm, bridgeAddress, callback));
		}
		methodSeries.push((callback: any) => withdraw(contractFn, params, callback));
		async.series(methodSeries, (err: any, results: any) => {
			setTxStatus(!!err ? 'error' : 'success');
		});
	};

	const withdraw = async (contractFn: any, params: any, callback: any) => {
		let result: any;
		let trade: any = null;
		let commited: boolean = false;
		let completed: boolean = false;

		result = await gatewayJS
			.open({
				sendToken: GatewayJS.Tokens.BTC.Eth2Btc,
				sendTo: bridgeAddress,
				contractFn: contractFn,
				contractParams: params,
				web3Provider: web3.currentProvider,
				txConfig: { gas: 1000000 },
			})
			.result()
			.on('status', async (status: any) => {
				console.info(`[BURN STATUS] ${status}`);
			})
			.on('transferUpdated', (transfer: any) => {
				console.info(`[BURN TRANSFER]`, transfer);
				trade = transfer;
				switch (transfer.status) {
					case 'burn_committed':
						if (commited) return;
						updateTx(connectedAddress, transfer);
						commited = true;
					case 'burn_returnedFromRenVM':
						if (completed) return;
						updateTx(connectedAddress, transfer);
						completed = true;
					default:
						updateTx(connectedAddress, transfer);
				}
			})
			.catch((error: any) => {
				console.log(`[BURN ERROR] ${error}`);
				if (error.message !== 'Transfer cancelled by user') {
					console.error(error.message);
					return;
				}
				if (!trade) return;
				removeTx(trade);
				queueNotification('Transfer cancelled by user', 'error');
				resetState();
			});
		if (!trade) return;
		if (trade.status === 'burn_returnedFromRenVM') {
			queueNotification('Release is successful', 'success');
			console.log(`SUCCESS ${trade.status} ${result}`);
			console.log(`Withdrew ${amount} BTC to ${btcAddr}.`);
			console.log(result);
			nextStep();
			removeTx(trade);
		}
	};

	const getEstimatedSlippage = async (amount: number, name: string) => {
		if (isNaN(amount) || amount <= 0) {
			return 0;
		}

		try {
			const curve = new web3.eth.Contract(CURVE_EXCHANGE, CURVE_WBTC_RENBTC_TRADING_PAIR_ADDR);
			// TODO: In production, we actually want to calculate this based on the expected badger/renVM fees.
			// For testing purposes we'll just make the minimum mint amount 95% of the mint amount.
			const amountAfterFeesInSats = Math.floor(amount * 0.95 * 10 ** 8);
			let swapResult;
			if (name === 'amount') {
				swapResult = await curve.methods.get_dy(0, 1, amountAfterFeesInSats).call();
			} else if (name === 'burnAmount') {
				swapResult = await curve.methods.get_dy(1, 0, amountAfterFeesInSats).call();
			} else {
				console.error(`expected mint or burn tx got: ${name}`);
				return 0;
			}
			console.log(swapResult, amountAfterFeesInSats);
			const swapRatio = Number(swapResult / amountAfterFeesInSats);
			if (swapRatio >= 1) return 0;
			return 1 - swapRatio;
		} catch (err) {
			return 0;
		}
	};

	const calcFees = async (inputAmount: any, name: string) => {
		const estimatedSlippage = await getEstimatedSlippage(parseFloat(inputAmount), name);
		const renFeeAmount = inputAmount * (tabValue === 0 ? renvmMintFee : renvmBurnFee);
		const badgerFeeAmount = inputAmount * (tabValue === 0 ? badgerMintFee : badgerBurnFee);
		const amountWithFee = inputAmount - renFeeAmount - badgerFeeAmount - networkFee;

		console.log('estimatedSlippage ->', estimatedSlippage);
		setStates((prevState) => ({
			...prevState,
			[name]: inputAmount,
			receiveAmount: amountWithFee < 0 ? 0 : amountWithFee,
			renFee: renFeeAmount,
			badgerFee: badgerFeeAmount,
			estimatedSlippage,
		}));
	};

	const handleChange = (name: string) => async (event: any) => {
		if (name === 'amount' || name === 'burnAmount') {
			const inputAmount = event.target.value;
			if (!isFinite(inputAmount)) return;
			const estimatedSlippage = await getEstimatedSlippage(parseFloat(inputAmount), name);
			await calcFees(inputAmount, name);
			// const renFeeAmount =
			//   inputAmount * (tabValue === 0 ? renvmMintFee : renvmBurnFee);
			// const badgerFeeAmount =
			//   inputAmount * (tabValue === 0 ? badgerMintFee : badgerBurnFee);
			// const amountWithFee =
			//   inputAmount - renFeeAmount - badgerFeeAmount - networkFee;

			// console.log("estimatedSlippage ->", estimatedSlippage);
			// setStates((prevState) => ({
			//   ...prevState,
			//   [name]: inputAmount,
			//   receiveAmount: amountWithFee < 0 ? 0 : amountWithFee,
			//   renFee: renFeeAmount,
			//   badgerFee: badgerFeeAmount,
			//   estimatedSlippage,
			// }));
		} else {
			const value = event.target.value;
			setStates((prevState) => ({
				...prevState,
				[name]: value,
			}));
		}
	};

	const itemContainer = (label: string, item: any) => {
		return (
			<Grid item xs={12}>
				<div className={classes.itemContainer}>
					<div>{label}</div>
					<div>{item}</div>
				</div>
			</Grid>
		);
	};
	const bridgeTabs = () => {
		return (
			<Tabs
				value={tabValue}
				onChange={handleTabChange}
				aria-label="Bridge Tabs"
				indicatorColor="primary"
				textColor="primary"
				className={classes.tabsContainer}
				centered
			>
				<Tab label="Mint" {...a11yProps(0)} />
				<Tab label="Release" {...a11yProps(1)} />
			</Tabs>
		);
	};
	const assetSelect = () => {
		return (
			<Grid item xs={6}>
				<FormControl>
					<Select
						onChange={handleChange('token')}
						value={values.token}
						inputProps={{
							name: 'token',
							id: 'token-select',
						}}
					>
						<MenuItem value={'renBTC'}>
							<span className={classes.menuItem}>
								<img src={renBTCLogo} className={classes.logo} />
								<span>renBTC</span>
							</span>
						</MenuItem>
						<MenuItem value={'WBTC'}>
							<span className={classes.menuItem}>
								<img src={WBTCLogo} className={classes.logo} />
								<span>WBTC</span>
							</span>
						</MenuItem>
					</Select>
				</FormControl>
			</Grid>
		);
	};

	const pageSwitcher = () => {
		switch (step) {
			case 1: // first step
				return (
					<Grid item xs={12}>
						<Grid item xs={12}>
							{bridgeTabs()}
						</Grid>
						{spacer}
						<TabPanel value={tabValue} index={0}>
							<MintForm
								values={values}
								handleChange={handleChange}
								previousStep={previousStep}
								nextStep={nextStep}
								classes={classes}
								assetSelect={assetSelect}
								itemContainer={itemContainer}
								connectWallet={connectWallet}
							/>
						</TabPanel>
						<TabPanel value={tabValue} index={1}>
							<ReleaseForm
								values={values}
								handleChange={handleChange}
								previousStep={previousStep}
								nextStep={nextStep}
								classes={classes}
								updateState={updateState}
								assetSelect={assetSelect}
								itemContainer={itemContainer}
								connectWallet={connectWallet}
								calcFees={calcFees}
							/>
						</TabPanel>
					</Grid>
				);
			case 2:
				return (
					<Grid item xs={12} className={classes.cardContainer}>
						<ConfirmForm
							values={values}
							handleChange={handleChange}
							previousStep={previousStep}
							confirmStep={confirmStep}
							classes={classes}
							shortenAddress={shortenAddress}
							itemContainer={itemContainer}
						/>
					</Grid>
				);
			case 3:
				return (
					<Grid item xs={12} className={classes.cardContainer}>
						<SuccessForm
							values={values}
							classes={classes}
							updateState={updateState}
							resetState={resetState}
						/>
					</Grid>
				);
			default:
				return <div></div>;
		}
	};

	return (
		<Grid container>{incompleteTransfer ? <ResumeForm values={values} classes={classes} /> : pageSwitcher()}</Grid>
	);
});
