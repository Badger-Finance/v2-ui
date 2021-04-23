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
import crvBTCLogo from 'assets/tokens/bcrvRenWBTC.png';
import { NETWORK_LIST, CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS, FLAGS } from 'config/constants';
import { bridge_system, tokens, sett_system } from 'config/deployments/mainnet.json';
import { CURVE_EXCHANGE } from 'config/system/abis/CurveExchange';

const DECIMALS = 10 ** 8;
const SETT_DECIMALS = 10 ** 18;

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
		token: 'renBTC' | 'WBTC' | 'bWBTC' | 'bCRVrenBTC' | 'bCRVsBTC' | 'bCRVtBTC';
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
			token: newValue !== 1 ? 'renBTC' : FLAGS.BWBTC_FLAG ? 'bWBTC' : 'bCRVrenBTC',
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
		if (tabValue <= 1) {
			deposit();
		} else if (tabValue === 2) {
			approveAndWithdraw();
		}
	};

	const updateState = (name: string, value: unknown) => {
		setStates((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const vaultAddress = () => {
		switch (token) {
			case 'bWBTC':
				return sett_system.vaults['yearn.wBtc'];
			case 'bCRVrenBTC':
				return sett_system.vaults['native.renCrv'];
			case 'bCRVsBTC':
				return sett_system.vaults['native.sbtcCrv'];
			case 'bCRVtBTC':
				return sett_system.vaults['native.tbtcCrv'];
			default:
				return '0x0000000000000000000000000000000000000000';
		}
	};

	const tokenAddress = () => {
		switch (token) {
			case 'renBTC':
				return tokens.renBTC;
			case 'WBTC':
				return tokens.wBTC;
			case 'bWBTC':
				return sett_system.vaults['yearn.wBtc'];
			case 'bCRVrenBTC':
				return sett_system.vaults['native.renCrv'];
			case 'bCRVsBTC':
				return sett_system.vaults['native.sbtcCrv'];
			case 'bCRVtBTC':
				return sett_system.vaults['native.tbtcCrv'];
			default:
				return '0x0000000000000000000000000000000000000000';
		}
	};

	const decimals = () => {
		switch (token) {
			case 'bCRVrenBTC':
			case 'bCRVsBTC':
			case 'bCRVtBTC':
				return SETT_DECIMALS;
			case 'renBTC':
			case 'WBTC':
			case 'bWBTC':
			default:
				return DECIMALS;
		}
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
				value: vaultAddress(),
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
		// Burn token decimals vary based on token/sett (e.g. most setts are 18 decimals whereas btc variants are 8 decimals)
		const amountOut = new BigNumber(burnAmount as any).multipliedBy(decimals());
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
				value: vaultAddress(),
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
				value: amountOut.toString(),
			},
		];

		const tokenParam = {
			address: tokenAddress(),
			symbol: token,
			totalSupply: amountOut,
		};

		const allowance: number = await new Promise((resolve, reject) => {
			getAllowance(tokenParam, bridge_system['adapter'], (err: unknown | undefined, result: number) => {
				if (err) reject(err);
				resolve(result);
			});
		});
		if (amountOut.toNumber() > allowance) {
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

		const renFeeAmount = inputAmount * (tabValue <= 1 ? renvmMintFee : renvmBurnFee);
		const badgerFeeAmount = inputAmount * (tabValue <= 1 ? badgerMintFee : badgerBurnFee);
		const networkFee = tabValue <= 1 ? lockNetworkFee : releaseNetworkFee;
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
				<Tab label="Mint & Earn" {...a11yProps(1)} />
				<Tab label="Release" {...a11yProps(2)} />
			</Tabs>
		);
	};

	const assetSelect = () => {
		return (
			<FormControl>
				{tabValue === 0 && (
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
					</Select>
				)}

				{tabValue === 1 && (
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
						{FLAGS.BWBTC_FLAG && (
							<MenuItem value={'bWBTC'}>
								<span className={classes.menuItem}>
									<img src={bWBTCLogo} className={classes.logo} />
									<span>bWBTC</span>
								</span>
							</MenuItem>
						)}

						<MenuItem value={'bCRVrenBTC'}>
							<span className={classes.menuItem}>
								<img src={crvBTCLogo} className={classes.logo} />
								<span>bCRVrenBTC</span>
							</span>
						</MenuItem>

						<MenuItem value={'bCRVsBTC'}>
							<span className={classes.menuItem}>
								<img src={crvBTCLogo} className={classes.logo} />
								<span>bCRVsBTC</span>
							</span>
						</MenuItem>

						<MenuItem value={'bCRVtBTC'}>
							<span className={classes.menuItem}>
								<img src={crvBTCLogo} className={classes.logo} />
								<span>bCRVtBTC</span>
							</span>
						</MenuItem>
					</Select>
				)}

				{tabValue === 2 && (
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

						{FLAGS.BWBTC_FLAG && (
							<MenuItem value={'bWBTC'}>
								<span className={classes.menuItem}>
									<img src={bWBTCLogo} className={classes.logo} />
									<span>bWBTC</span>
								</span>
							</MenuItem>
						)}

						<MenuItem value={'bCRVrenBTC'}>
							<span className={classes.menuItem}>
								<img src={crvBTCLogo} className={classes.logo} />
								<span>bCRVrenBTC</span>
							</span>
						</MenuItem>

						<MenuItem value={'bCRVsBTC'}>
							<span className={classes.menuItem}>
								<img src={crvBTCLogo} className={classes.logo} />
								<span>bCRVsBTC</span>
							</span>
						</MenuItem>

						<MenuItem value={'bCRVtBTC'}>
							<span className={classes.menuItem}>
								<img src={crvBTCLogo} className={classes.logo} />
								<span>bCRVtBTC</span>
							</span>
						</MenuItem>
					</Select>
				)}
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
								isEarn={false}
							/>
						</TabPanel>
						<TabPanel value={tabValue} index={1}>
							<MintForm
								values={values}
								handleChange={handleChange}
								handleSetMaxSlippage={handleSetMaxSlippage}
								previousStep={previousStep}
								nextStep={nextStep}
								classes={classes}
								assetSelect={assetSelect}
								connectWallet={connectWallet}
								isEarn={true}
							/>
						</TabPanel>
						<TabPanel value={tabValue} index={2}>
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
