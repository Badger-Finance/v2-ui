import React, { useContext, useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import GatewayJS from '@renproject/gateway';
import Web3 from 'web3';
import async, { any } from 'async';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Grid, Tabs, Tab, FormControl, Select, MenuItem } from '@material-ui/core';
import useInterval from '@use-it/interval';
import { MintForm } from './MintForm';
import { ReleaseForm } from './ReleaseForm';
import { ConfirmForm } from './ConfirmForm';
import { SuccessForm } from './SuccessForm';
import { ResumeForm } from './ResumeForm';

import renBTCLogo from '../../assets/icons/renBTC.svg';
import WBTCLogo from '../../assets/icons/WBTC.svg';
import BTCLogo from '../../assets/icons/btc.svg';
import {
        ERC20,
        BADGER_ADAPTER,
        CURVE_EXCHANGE,
        BTC_GATEWAY,
        WBTC_ADDRESS,
        RENBTC_ADDRESS,
        CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS,
        RENVM_GATEWAY_ADDRESS,
} from '../../config/constants';
import { bridge_system } from 'config/deployments/mainnet.json';

const MIN_AMOUNT = 0.002;
// SLIPPAGE_BUFFER increases estimated max slippage by 3%.
const SLIPPAGE_BUFFER = 0.03;
const MAX_BPS = 10000;
const UPDATE_INTERVAL_SECONDS = 30 * 1000; // 30 seconds

interface TabPanelProps {
	children: any,
	index: number,
	value: number,
	other?: any | unknown
}

const TabPanel = (props: TabPanelProps) => {
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


const a11yProps = (index: number) => {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
};


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
		bridgeAddress: bridge_system["adapter"],
		shortAddr: '',
		badgerBurnFee: 0,
		badgerMintFee: 0,
		renvmBurnFee: 0,
		renvmMintFee: 0,
		renFee: 0,
		badgerFee: 0,
		lockNetworkFee: 0.001,
		releaseNetworkFee: 0.001,
		tabValue: 0, // Keep on same tab even after reset
	};
	const [states, setStates] = useState(intialState);

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
		lockNetworkFee,
		releaseNetworkFee
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
		lockNetworkFee,
		releaseNetworkFee,
		bridgeAddress
	};

	const gatewayJS = new GatewayJS('mainnet');

	const web3 = new Web3(provider);
	const adapterContract = new web3.eth.Contract(BADGER_ADAPTER, bridgeAddress);
	const renbtcToken = new web3.eth.Contract(ERC20.abi as any, RENBTC_ADDRESS);
	const wbtcToken = new web3.eth.Contract(ERC20.abi as any, WBTC_ADDRESS);
	const gatewayContract = new web3.eth.Contract(BTC_GATEWAY, RENVM_GATEWAY_ADDRESS);

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
			receiveAmount: 0,
			burnAmount: '',
			amount: '',
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
			approveAndWithdraw()
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

	const getBtcNetworkFees = async () => {
		const query = {
			jsonrpc: "2.0",
			method: "ren_queryFees",
			id: 67,
			params: {}
		};

		await fetch('https://lightnode-mainnet.herokuapp.com/', {
			method: 'POST',
			body: JSON.stringify(query),
			headers: { 'Content-Type': 'application/json' }
		}).then(res => res.json())
		  .then(json => {
			  updateState('lockNetworkFee', parseInt(json.result.btc.lock) / 100000000);
			  updateState('releaseNetworkFee', parseInt(json.result.btc.release) / 100000000);
		});
	}

	const getFeesFromContract = async () => {
		if (!connectedAddress) {
			return;
		}
                const [
                        badgerBurnFee,
                        badgerMintFee,
                        renvmBurnFee,
                        renvmMintFee,
                ] = (await Promise.all([
                        adapterContract.methods.burnFeeBps().call(),
                        adapterContract.methods.mintFeeBps().call(),
                        gatewayContract.methods.burnFee().call(),
                        gatewayContract.methods.mintFee().call(),
                ])).map((result: number) => result / MAX_BPS);

		setStates((prevState) => ({
			...prevState,
                        badgerBurnFee,
                        badgerMintFee,
                        renvmBurnFee,
                        renvmMintFee,
                }));
	};

	const updateBalance = async () => {
		if (!connectedAddress) {
			return;
		}
		const [
                        renbtc_Balance,
                        wbtc_Balance,
                ] = await Promise.all([
                        renbtcToken.methods.balanceOf(connectedAddress).call(),
                        wbtcToken.methods.balanceOf(connectedAddress).call(),
                ]);

		setStates((prevState) => ({
			...prevState,
			renbtcBalance: parseInt(renbtc_Balance.toString()) / 10 ** 8,
			wbtcBalance: parseInt(wbtc_Balance.toString()) / 10 ** 8,
		}));
	};

	useEffect(() => {
		if (incompleteTransfer) {
			queueNotification('There is incomplete Transfer', 'info');
		}
	}, [incompleteTransfer]);

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
		getBtcNetworkFees();
		getFeesFromContract();
		updateBalance();
	}, [connectedAddress, shortAddr]);

        useInterval(updateBalance, UPDATE_INTERVAL_SECONDS);

	const deposit = async () => {
		const amountSats = new BigNumber(parseFloat(amount) * 10 ** 8); // Convert to Satoshis)
		let trade: any = null;
		let result: any;
		let commited: boolean = false;
		let completed: boolean = false;
		const contractFn: string = 'mint';
		let maxSlippage = 0;
		let desiredToken = RENBTC_ADDRESS;
		if (token === 'WBTC') {
			maxSlippage = Math.min(estimatedSlippage * SLIPPAGE_BUFFER, 1);
			desiredToken = WBTC_ADDRESS
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
					if (status === 'mint_returnedFromRenVM') {
						queueNotification(
							'BTC deposit is ready, please sign the transaction to submit to ethereum',
							'info',
						);
					}
				})
				.on('transferUpdated', (transfer: any) => {
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
                                                queueNotification(`Mint failed: ${error.message}`, 'error');
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
				removeTx(trade);
				nextStep();
			}
		} catch (error) {
                        queueNotification(`Mint failed: ${error.message}`, 'error');
		}
	};

	const approveAndWithdraw = async () => {
		let methodSeries: any = [];
		const contractFn: any = 'burn';
		const amountSats = new BigNumber((burnAmount as any) * 10 ** 8);
		let burnToken = RENBTC_ADDRESS;
		let maxSlippage = 0;
		if (token === 'WBTC') {
			burnToken = WBTC_ADDRESS;
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
			},
			{
				name: '_amount',
				type: 'uint256',
				value: amountSats,
			},
		];

		const tokenParam = {
			address: token === 'renBTC' ? RENBTC_ADDRESS : WBTC_ADDRESS,
			symbol: token,
			totalSupply: amountSats,
		};

		const allowance: number = await new Promise((resolve, reject) => {
			getAllowance(tokenParam, bridgeAddress, (err: any, result: number) => {
				if (err) reject(err);
				resolve(result);
			});
		});
		if (amountSats.toNumber() > allowance) {
			methodSeries.push((callback: any) => increaseAllowance(tokenParam, bridgeAddress, callback));
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
				if (error.message !== 'Transfer cancelled by user') {
                                        queueNotification(`Burn error ${error.message}`, 'error');
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
			nextStep();
			removeTx(trade);
		}
	};

	const getEstimatedSlippage = async (amount: number, name: string) => {
		if (isNaN(amount) || amount <= 0) {
			return 0;
		}

		try {
			const curve = new web3.eth.Contract(CURVE_EXCHANGE, CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS);
			const amountAfterFeesInSats = new BigNumber(amount * 10 ** 8);
			let swapResult;
			if (name === 'amount') {
				swapResult = await curve.methods.get_dy(0, 1, amountAfterFeesInSats).call();
			} else if (name === 'burnAmount') {
				swapResult = await curve.methods.get_dy(1, 0, amountAfterFeesInSats).call();
			} else {
				console.error(`expected mint or burn tx got: ${name}`);
				return 0;
			}
			const swapRatio = Number(swapResult / amountAfterFeesInSats.toNumber());

			if (swapRatio >= 1) return 0;
			return 1 - swapRatio;
		} catch (err) {
                        queueNotification('WARNING: Failed to estimate slippage', 'error');
			return 0;
		}
	};

	const calcFees = async (inputAmount: any, name: string) => {
		let estimatedSlippage = 0; // only need to calculate slippage for wbtc mint/burn

		const renFeeAmount = inputAmount * (tabValue === 0 ? renvmMintFee : renvmBurnFee);
		const badgerFeeAmount = inputAmount * (tabValue === 0 ? badgerMintFee : badgerBurnFee);
		const networkFee = tabValue === 0 ? lockNetworkFee : releaseNetworkFee;
		const amountWithFee = inputAmount - renFeeAmount - badgerFeeAmount - networkFee;
		if (token === 'WBTC') {
			estimatedSlippage = await getEstimatedSlippage(amountWithFee, name);
		}
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
			await calcFees(inputAmount, name);
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
