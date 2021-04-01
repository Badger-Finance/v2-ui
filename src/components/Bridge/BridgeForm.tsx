import React, { PropsWithChildren, ReactNode, useContext, useState, useEffect, useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import GatewayJS from '@renproject/gateway';
import { EthArgs, LockAndMintParamsSimple, BurnAndReleaseParamsSimple } from '@renproject/interfaces';
import Web3 from 'web3';
import async from 'async';
import { observer } from 'mobx-react-lite';
import { Grid, Tabs, Tab, FormControl, Select, MenuItem, Typography } from '@material-ui/core';

import { MintForm } from './MintForm';
import { ReleaseForm } from './ReleaseForm';
import { RenVMTransaction } from 'mobx/model';
import { Status } from 'mobx/stores/bridgeStore';
import { StoreContext } from 'mobx/store-context';
import { SuccessForm } from './SuccessForm';
import { ConfirmForm } from './ConfirmForm';
import { ValuesProp } from './Common';
import WBTCLogo from 'assets/icons/WBTC.svg';
import bWBTCLogo from 'assets/icons/bWBTC.svg';
import renBTCLogo from 'assets/icons/renBTC.svg';
import { NETWORK_LIST, CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS } from 'config/constants';
import { bridge_system, tokens } from 'config/deployments/mainnet.json';
import { CURVE_EXCHANGE } from 'config/system/abis/CurveExchange';

type TabPanelProps = PropsWithChildren<{
	index: number;
	value: number;
	other?: any | unknown;
}>;

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

// Gateways expects nonce as a bytes32 hex string.
const formatNonceBytes32 = (nonce: number): string => {
	return ethers.utils.hexZeroPad(`0x${nonce.toString(16)}`, 32);
};

// Initial state value that should be reset to initial values on reset.
const initialStateResettable = {
	amount: '',
	receiveAmount: 0,
	estimatedSlippage: 0,
	// Default to 0.5%.
	maxSlippage: '.5',
	burnAmount: '',
	btcAddr: '',
	renFee: 0,
	badgerFee: 0,
	step: 1,
};

export const BridgeForm = observer(({ classes }: any) => {
	const store = useContext(StoreContext);
	const spacer = <div className={classes.before} />;

	const {
		wallet: { connect, connectedAddress, provider, onboard, network },
		contracts: { getAllowance, increaseAllowance },
		uiState: { queueNotification, setTxStatus },
		bridge: {
			status,
			begin,
			nextNonce,
			loading,
			error,

			badgerBurnFee,
			badgerMintFee,
			renvmBurnFee,
			renvmMintFee,
			lockNetworkFee,
			releaseNetworkFee,
		},
	} = store;

	const initialTokenState: {
		token: 'renBTC' | 'WBTC' | 'bWBTC';
	} = {
		token: 'renBTC',
	};

	const intialState = {
		...initialTokenState,
		...initialStateResettable,
		tabValue: 0, // Keep on same tab even after reset
	};

	const [states, setStates] = useState(intialState);

	const {
		token,
		amount,
		receiveAmount,
		step,
		burnAmount,
		btcAddr,
		tabValue,
		estimatedSlippage,
		maxSlippage,
		renFee,
		badgerFee,
	} = states;

	// TODO: Refactor values to pull directly from mobx store for values in store.
	const values: ValuesProp = {
		token,
		amount,
		receiveAmount,
		step,
		burnAmount,
		btcAddr,
		tabValue,
		spacer,
		estimatedSlippage,
		maxSlippage,
		renFee,
		badgerFee,
	};

	const connectWallet = async () => {
		if (!(await onboard.walletSelect())) return;
		const readyToTransact = await onboard.walletCheck();
		if (readyToTransact) {
			connect(onboard);
		}
	};

	const resetState = useCallback(() => {
		// Reset everything except balances
		setStates((prevState) => ({
			...prevState,
			...initialStateResettable,
		}));
	}, []);

	const handleTabChange = (_: unknown, newValue: number) => {
		setStates((prevState) => ({
			...prevState,
			tabValue: newValue,
			receiveAmount: 0,
			burnAmount: '',
			amount: '',
		}));
	};

	const handleSetMaxSlippage = (newValue: string) => () => {
		setStates((prevState) => ({
			...prevState,
			maxSlippage: newValue,
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
			approveAndWithdraw();
		}
	};

	const updateState = (name: string, value: unknown) => {
		setStates((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	useEffect(() => {
		// Reset to original state if we're disconnected in middle
		// of transaction.
		if (!connectedAddress && step !== 1) {
			resetState();
			return;
		}
	}, [connectedAddress, step, resetState]);

	// TODO: Can refactor most of these methods below into the store as well.
	const deposit = async () => {
		const amountSats = new BigNumber(amount).multipliedBy(10 ** 8); // Convert to Satoshis
		let desiredToken = tokens.renBTC;
		let maxSlippageBps = 0;

		if (token === 'WBTC' || token === 'bWBTC') {
			// Convert max slippage from % to bps.
			maxSlippageBps = Math.round(parseFloat(maxSlippage) * 100);
			desiredToken = tokens.wBTC;
		}

		const contractParams: EthArgs = [
			{
				name: '_token',
				type: 'address',
				value: desiredToken,
			},
			{
				name: '_slippage',
				type: 'uint256',
				value: maxSlippageBps,
			},
			{
				name: '_user',
				type: 'address',
				value: connectedAddress,
			},
			{
				name: '_vault',
				type: 'address',
				// Will check in SC if address is addres(0), if not, will deposit to the desired vault
				value:
					token === 'bWBTC'
						? tokens.bWBTC
						: '0x0000000000000000000000000000000000000000',
			},
		];

		const params: LockAndMintParamsSimple = {
			sendToken: GatewayJS.Tokens.BTC.Btc2Eth,
			suggestedAmount: amountSats.toString(),
			sendTo: bridge_system['adapter'],
			nonce: formatNonceBytes32(nextNonce),
			contractFn: 'mint',
			contractParams,
		};

		await begin({ params } as RenVMTransaction, () => {
			resetState();
		});
	};

	const approveAndWithdraw = async () => {
		const methodSeries: any = [];
		const amountSats = new BigNumber(burnAmount as any).multipliedBy(10 ** 8); // Convert to Satoshis
		let burnToken = tokens.renBTC;
		let maxSlippageBps = 0;

		if (token === 'WBTC' || token === 'bWBTC') {
			burnToken = tokens.wBTC;
			// Convert max slippage from % to bps.
			maxSlippageBps = Math.round(parseFloat(maxSlippage) * 100);
		}

		const params = [
			{
				name: '_token',
				type: 'address',
				value: burnToken,
			},
			{
				name: '_vault',
				type: 'address',
				// Will check in SC if address is addres(0), if not, will deposit to the desired vault
				value:
					token === 'bWBTC'
						? tokens.bWBTC
						: '0x0000000000000000000000000000000000000000',
			},
			{
				name: '_slippage',
				type: 'uint256',
				value: maxSlippageBps,
			},
			{
				name: '_to',
				type: 'bytes',
				value: '0x' + Buffer.from(btcAddr).toString('hex'),
			},
			{
				name: '_amount',
				type: 'uint256',
				value: amountSats.toString(),
			},
		];

		const tokenParam = {
			address:
				token === 'renBTC'
					? tokens.renBTC
					: token === 'bWBTC'
					? tokens.bWBTC
					: tokens.wBTC,
			symbol: token,
			totalSupply: amountSats,
		};

		const allowance: number = await new Promise((resolve, reject) => {
			getAllowance(tokenParam, bridge_system['adapter'], (err: unknown | undefined, result: number) => {
				if (err) reject(err);
				resolve(result);
			});
		});
		if (amountSats.toNumber() > allowance) {
			methodSeries.push((callback: (...params: unknown[]) => unknown) =>
				increaseAllowance(tokenParam, bridge_system['adapter'], callback),
			);
		}
		methodSeries.push(() => withdraw(params));
		async.series(methodSeries, (err?: unknown) => {
			setTxStatus(!!err ? 'error' : 'success');
		});
	};

	const withdraw = async (contractParams: EthArgs) => {
		const params: BurnAndReleaseParamsSimple = {
			sendToken: GatewayJS.Tokens.BTC.Eth2Btc,
			sendTo: bridge_system['adapter'],
			nonce: formatNonceBytes32(nextNonce),
			contractFn: 'burn',
			contractParams,
		};

		await begin({ params } as RenVMTransaction, () => {
			resetState();
		});
	};

	const getEstimatedSlippage = async (amount: number, name: string) => {
		if (isNaN(amount) || amount <= 0) {
			return 0;
		}

		try {
			const web3 = new Web3(provider);
			const curve = new web3.eth.Contract(CURVE_EXCHANGE, CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS);
			const amountAfterFeesInSats = new BigNumber(amount.toFixed(8)).multipliedBy(10 ** 8);
			let swapResult;
			if (name === 'amount') {
				swapResult = await curve.methods.get_dy(0, 1, amountAfterFeesInSats.toString()).call();
			} else if (name === 'burnAmount') {
				swapResult = await curve.methods.get_dy(1, 0, amountAfterFeesInSats.toString()).call();
			} else {
				return 0;
			}
			const swapRatio = new BigNumber(swapResult.toString()).dividedBy(amountAfterFeesInSats).toNumber();

			if (swapRatio >= 1) return 0;
			return 1 - swapRatio;
		} catch (err) {
			queueNotification(`WARNING: Failed to estimate slippage (${err.message})`, 'error');
			return 0;
		}
	};

	const calcFees = async (inputAmount: number, name: string) => {
		let estimatedSlippage = 0; // only need to calculate slippage for wbtc mint/burn

		const renFeeAmount = inputAmount * (tabValue === 0 ? renvmMintFee : renvmBurnFee);
		const badgerFeeAmount = inputAmount * (tabValue === 0 ? badgerMintFee : badgerBurnFee);
		const networkFee = tabValue === 0 ? lockNetworkFee : releaseNetworkFee;
		let amountWithFee = inputAmount - renFeeAmount - badgerFeeAmount - networkFee;

		if (token === 'WBTC' || token === 'bWBTC') {
			estimatedSlippage = await getEstimatedSlippage(amountWithFee, name);
			amountWithFee *= 1 - estimatedSlippage;
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
		} else if (name === 'maxSlippage') {
			// TODO: Can do some further validation here.
			const value = event.target.value;
			if (!isFinite(value)) return;
			setStates((prevState) => ({
				...prevState,
				[name]: value,
			}));
		} else if (name === 'token') {
			const value = event.target.value;
			setStates((prevState) => ({
				...prevState,
				// Reset initial states when changing token.
				...initialStateResettable,
				[name]: value,
			}));
		} else {
			const value = event.target.value;
			setStates((prevState) => ({
				...prevState,
				[name]: value,
			}));
		}
	};

	const itemContainer = (label: string, item: ReactNode) => {
		return (
			<Grid item xs={12}>
				<div className={classes.itemContainer}>
					<Typography variant="subtitle1">{label}</Typography>
					<div>{item}</div>
				</div>
			</Grid>
		);
	};

	const bridgeTabs = () => {
		return (
			<Tabs
				value={tabValue}
				variant="fullWidth"
				onChange={handleTabChange}
				aria-label="Bridge Tabs"
				indicatorColor="primary"
				textColor="primary"
				className={classes.tabHeader}
			>
				<Tab label="Mint" {...a11yProps(0)} />
				<Tab label="Release" {...a11yProps(1)} />
			</Tabs>
		);
	};
	const assetSelect = () => {
		return (
			<FormControl>
				<Select
					variant="outlined"
					onChange={handleChange('token')}
					value={values.token}
					className={classes.select}
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

					<MenuItem value={'bWBTC'}>
						<span className={classes.menuItem}>
							<img src={bWBTCLogo} className={classes.logo} />
							<span>bWBTC</span>
						</span>
					</MenuItem>
				</Select>
			</FormControl>
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
								handleSetMaxSlippage={handleSetMaxSlippage}
								previousStep={previousStep}
								nextStep={nextStep}
								classes={classes}
								assetSelect={assetSelect}
								connectWallet={connectWallet}
							/>
						</TabPanel>
						<TabPanel value={tabValue} index={1}>
							<ReleaseForm
								values={values}
								handleChange={handleChange}
								handleSetMaxSlippage={handleSetMaxSlippage}
								previousStep={previousStep}
								nextStep={nextStep}
								classes={classes}
								updateState={updateState}
								assetSelect={assetSelect}
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

	if (network.name !== NETWORK_LIST.ETH) {
		return (
			<Grid container alignItems={'center'} className={classes.padded}>
				The Badger Bridge is only supported on Ethereum Mainnet.
			</Grid>
		);
	}

	if (error) {
		return (
			<Grid container alignItems={'center'} className={classes.padded}>
				Error: {error.message}
			</Grid>
		);
	}

	if (loading) {
		return (
			<Grid container alignItems={'center'} className={classes.padded}>
				Loading...
			</Grid>
		);
	}

	if (status != Status.IDLE) {
		return (
			<Grid container alignItems={'center'} className={classes.padded}>
				Transaction in progress...
			</Grid>
		);
	}

	return <Grid container>{pageSwitcher()}</Grid>;
});
