import deploy from '../deployments/mainnet.json';
import bscDeploy from '../deployments/bsc.json';
import maticDeploy from '../deployments/matic.json';
import { NETWORK_LIST } from '../constants';
import BigNumber from 'bignumber.js';
import { StrategyNetworkConfig } from '../../mobx/model/strategies/strategy-network-config';
import { StrategyFee } from '../../mobx/model/system-config/stategy-fees';

// TODO: add descriptions and deposit instructions after marketing team provides them
export const getStrategies = (network?: string | null): StrategyNetworkConfig => {
	switch (network) {
		case NETWORK_LIST.MATIC:
			return {
				[maticDeploy.sett_system.vaults['BSLP-IBBTC-WBTC']]: {
					name: '',
					address: maticDeploy.sett_system.strategies['BSLP-IBBTC-WBTC'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: '',
					depositLink:
						'https://app.sushi.com/add/0x4EaC4c4e9050464067D673102F8E24b2FccEB350/0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
				},
				[maticDeploy.sett_system.vaults['BQLP-WBTC-USDC']]: {
					name: '',
					address: maticDeploy.sett_system.strategies['BQLP-WBTC-USDC'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: '',
					depositLink:
						'https://quickswap.exchange/#/add/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
				},
				[maticDeploy.sett_system.vaults['BATRICRYPTO']]: {
					name: '',
					address: maticDeploy.sett_system.strategies['BATRICRYPTO'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: '',
					depositLink: 'https://polygon.curve.fi/atricrypto/deposit',
				},
				[maticDeploy.sett_system.vaults['BCRV-WBTC-RENBTC']]: {
					name: '',
					address: maticDeploy.sett_system.strategies['BCRV-WBTC-RENBTC'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: '',
					depositLink: 'https://polygon.curve.fi/ren/deposit',
				},
			};
		case NETWORK_LIST.BSC:
			return {
				[bscDeploy.sett_system.vaults['native.pancakeBnbBtcb']]: {
					name: 'StrategyPancakeLpOptimizer',
					address: bscDeploy.sett_system.strategies['native.pancakeBnbBtcb'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#3c3ab0a9435d4b35bad25553a9eeb7f9',
				},
				[bscDeploy.sett_system.vaults['native.bBadgerBtcb']]: {
					name: 'StrategyPancakeLpOptimizer',
					address: bscDeploy.sett_system.strategies['native.bBadgerBtcb'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#d40fae9575c641d7a875069c6fb7f2ad',
				},
				[bscDeploy.sett_system.vaults['native.bDiggBtcb']]: {
					name: 'StrategyPancakeLpOptimizer',
					address: bscDeploy.sett_system.strategies['native.bDiggBtcb'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#7367ef32aedf4a1dae8697dfc170d7f3',
				},
			};
		default:
			return {
				[deploy.sett_system.vaults['native.badger']]: {
					name: 'Badger',
					address: deploy.sett_system.strategies['native.badger'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(0),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#fe02e2fa6ea446ca9b975d1eecf3120c',
				},
				[deploy.sett_system.vaults['native.renCrv']]: {
					name: 'StrategyCurveGauge',
					address: deploy.sett_system.strategies['native.renCrv'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#2304f0f6a0684aee82853f9635211ec9',
					depositLink: 'https://curve.fi/ren/deposit',
				},
				[deploy.sett_system.vaults['native.sbtcCrv']]: {
					name: 'StrategyCurveGauge',
					address: deploy.sett_system.strategies['native.sbtcCrv'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#ce634a6ad4b0486288180d775a1552ab',
					depositLink: 'https://curve.fi/sbtc/deposit',
				},
				[deploy.sett_system.vaults['native.tbtcCrv']]: {
					name: 'StrategyCurveGauge',
					address: deploy.sett_system.strategies['native.tbtcCrv'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#cba0515b901e423d892f9c0cf66b272f',
					depositLink: 'https://curve.fi/tbtc/deposit',
				},
				[deploy.sett_system.vaults['native.uniBadgerWbtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.uniBadgerWbtc'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(0),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#9da96d000b3e49cc92f04a49dd08a9bd',
					depositLink:
						'https://app.uniswap.org/#/add/0x3472A5A71965499acd81997a54BBA8D852C6E53d/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				},
				[deploy.sett_system.vaults['harvest.renCrv']]: {
					name: '',
					address: deploy.sett_system.strategies['harvest.renCrv'],
					// TODO: Remove harvest fees
					fees: {
						[StrategyFee.harvestPerformance]: new BigNumber(1000),
						[StrategyFee.harvestStrategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#e774231a9777465f9615e1c18d7fd151',
				},
				[deploy.sett_system.vaults['native.sushiWbtcEth']]: {
					name: '',
					description:
						'Provide liquidity in Sushiswap WBTC/ETH pool and receive SLP tokens in return, which ' +
						'represent your share of the pair. Deposit your SLP tokens in Badger protocol and get bSLP ' +
						'tokens in return. 50% of rewards are automatically compounded as the bSLP/LP ratio increases ' +
						'over time. LP tokens are deposited in Sushiswap’s Onsen. DIGG and xSushi incentive rewards ' +
						'can be claimed in the dashboard.',
					address: deploy.sett_system.strategies['native.sushiWbtcEth'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#2f5ee4a857754023af1fdba144a0c1be',
					depositLink: 'https://app.sushi.com/add/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/ETH',
				},
				[deploy.sett_system.vaults['native.sushiBadgerWbtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.sushiBadgerWbtc'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#46bfa12ac9d24b9bb7d28d1f9bc3256a',
					depositLink:
						'https://app.sushi.com/add/0x3472A5A71965499acd81997a54BBA8D852C6E53d/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				},
				[deploy.sett_system.vaults['native.digg']]: {
					name: '',
					address: deploy.sett_system.strategies['native.digg'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(0),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#b63c02c4f27f43229624da8abb377be2',
				},
				[deploy.sett_system.vaults['native.uniDiggWbtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.uniDiggWbtc'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(0),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#e6043ad7d2a94df39eee74a235f3faf8',
				},
				[deploy.sett_system.vaults['native.sushiDiggWbtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.sushiDiggWbtc'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#e1a46fc7a95d4f73b586435f45586748',
					depositLink:
						'https://app.sushi.com/add/0x798D1bE841a82a273720CE31c822C61a67a601C3/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				},
				[deploy.sett_system.vaults['yearn.wBtc']]: {
					name: '',
					address: deploy.sett_system.vaults['yearn.wBtc'],
					fees: {
						[StrategyFee.yearnPerformance]: new BigNumber(2000),
						[StrategyFee.yearnManagement]: new BigNumber(200),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#8dbbd221e429409db3b487da966a14b8',
				},
				[deploy.sett_system.vaults['native.sushiibBTCwBTC']]: {
					name: '',
					address: deploy.sett_system.strategies['experimental.sushiIBbtcWbtc'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(20),
					},
					strategyLink: 'https://badger.wiki/strategies#418b98a05da849a3a8dd97f74f8c0c80',
					depositLink:
						'https://app.sushi.com/add/0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				},
				[deploy.sett_system.vaults['experimental.digg']]: {
					name: '',
					address: deploy.sett_system.strategies['experimental.digg'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(250),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: '',
				},
				[deploy.sett_system.vaults['native.hbtcCrv']]: {
					name: '',
					address: deploy.sett_system.strategies['native.hbtcCrv'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#56cd7b65cd384740aa9f339bf3ee2597',
					depositLink: 'https://curve.fi/hbtc/deposit',
				},
				[deploy.sett_system.vaults['native.pbtcCrv']]: {
					name: '',
					address: deploy.sett_system.strategies['native.pbtcCrv'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#39a0decd933b4869b98c9276118b9d39',
					depositLink: 'https://curve.fi/pbtc/deposit',
				},
				[deploy.sett_system.vaults['native.obtcCrv']]: {
					name: '',
					address: deploy.sett_system.strategies['native.obtcCrv'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#82d72e94cb3b49f0836d8197ad13bc36',
					depositLink: 'https://curve.fi/obtc/deposit',
				},
				[deploy.sett_system.vaults['native.bbtcCrv']]: {
					name: '',
					address: deploy.sett_system.strategies['native.bbtcCrv'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#fe4a64edc830472da5a700d0fc30716c',
					depositLink: 'https://curve.fi/bbtc/deposit',
				},
				[deploy.sett_system.vaults['native.tricryptoCrv']]: {
					name: '',
					address: deploy.sett_system.strategies['native.tricrypto'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#f03b01a576d241aa9d9cee153876c976',
				},
				[deploy.sett_system.vaults['native.tricryptoCrv2']]: {
					name: '',
					address: deploy.sett_system.strategies['native.tricrypto2'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(2000),
						[StrategyFee.withdraw]: new BigNumber(20),
					},
					strategyLink: 'https://badger.wiki/strategies#d5806054c232432e8e8a1d75ae329bf8',
					depositLink: 'https://curve.fi/tricrypto2/deposit',
				},
				[deploy.sett_system.vaults['native.cvxCrv']]: {
					name: '',
					address: deploy.sett_system.strategies['native.cvxCrv'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					strategyLink: 'https://badger.wiki/strategies#51d48102bc4847a6a5a1a059c4b827b3',
				},
				[deploy.sett_system.vaults['native.cvx']]: {
					name: '',
					address: deploy.sett_system.strategies['native.cvx'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					strategyLink: 'https://badger.wiki/strategies#1346adfaad7946eebd29a17fb4f6e8b7',
				},
				[deploy.sett_system.vaults['native.imBtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.imBtc'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(75),
					},
					strategyLink: 'https://badgerwiki.notion.site/placeholder',
					depositLink: 'https://mstable.app/#/mbtc/save',
				},
				[deploy.sett_system.vaults['native.fPmBtcHBtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.fPmBtcHBtc'],
					fees: {
						[StrategyFee.daoPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(75),
					},
					strategyLink: 'https://badgerwiki.notion.site/placeholder',
					depositLink: 'https://mstable.app/#/mbtc/pools/0x48c59199da51b7e30ea200a74ea07974e62c4ba7',
				},
			};
	}
};
