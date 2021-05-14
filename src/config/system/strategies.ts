import deploy from '../deployments/mainnet.json';
import bscDeploy from '../deployments/bsc.json';
import { StrategyNetworkConfig } from 'mobx/model';
import { NETWORK_LIST } from '../../config/constants';
import BigNumber from 'bignumber.js';

export const getStrategies = (network?: string | null): StrategyNetworkConfig => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return {
				[bscDeploy.sett_system.vaults['native.pancakeBnbBtcb']]: {
					name: 'StrategyPancakeLpOptimizer',
					address: bscDeploy.sett_system.strategies['native.pancakeBnbBtcb'],
					fees: {
						['Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#3c3ab0a9435d4b35bad25553a9eeb7f9',
				},
				[bscDeploy.sett_system.vaults['native.bBadgerBtcb']]: {
					name: 'StrategyPancakeLpOptimizer',
					address: bscDeploy.sett_system.strategies['native.bBadgerBtcb'],
					fees: {
						['DAO Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#d40fae9575c641d7a875069c6fb7f2ad',
				},
				[bscDeploy.sett_system.vaults['native.bDiggBtcb']]: {
					name: 'StrategyPancakeLpOptimizer',
					address: bscDeploy.sett_system.strategies['native.bDiggBtcb'],
					fees: {
						['DAO Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
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
						['DAO Performance Fee']: new BigNumber(0),
						['Strategist Performance Fee']: new BigNumber(0),
						['Withdraw Fee']: new BigNumber(0),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#fe02e2fa6ea446ca9b975d1eecf3120c',
				},
				[deploy.sett_system.vaults['native.renCrv']]: {
					name: 'StrategyCurveGauge',
					address: deploy.sett_system.strategies['native.renCrv'],
					fees: {
						['DAO Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#2304f0f6a0684aee82853f9635211ec9',
				},
				[deploy.sett_system.vaults['native.sbtcCrv']]: {
					name: 'StrategyCurveGauge',
					address: deploy.sett_system.strategies['native.sbtcCrv'],
					fees: {
						['DAO Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#ce634a6ad4b0486288180d775a1552ab',
				},
				[deploy.sett_system.vaults['native.tbtcCrv']]: {
					name: 'StrategyCurveGauge',
					address: deploy.sett_system.strategies['native.tbtcCrv'],
					fees: {
						['DAO Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#cba0515b901e423d892f9c0cf66b272f',
				},
				[deploy.sett_system.vaults['native.uniBadgerWbtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.uniBadgerWbtc'],
					fees: {
						['DAO Performance Fee']: new BigNumber(0),
						['Strategist Performance Fee']: new BigNumber(0),
						['Withdraw Fee']: new BigNumber(0),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#9da96d000b3e49cc92f04a49dd08a9bd',
				},
				[deploy.sett_system.vaults['harvest.renCrv']]: {
					name: '',
					address: deploy.sett_system.strategies['harvest.renCrv'],
					fees: {
						['Harvest Performance Fee']: new BigNumber(1000),
						['Harvest Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#e774231a9777465f9615e1c18d7fd151',
				},
				[deploy.sett_system.vaults['native.sushiWbtcEth']]: {
					name: '',
					address: deploy.sett_system.strategies['native.sushiWbtcEth'],
					fees: {
						['DAO Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#2f5ee4a857754023af1fdba144a0c1be',
				},
				[deploy.sett_system.vaults['native.sushiBadgerWbtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.sushiBadgerWbtc'],
					fees: {
						['DAO Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#46bfa12ac9d24b9bb7d28d1f9bc3256a',
				},
				[deploy.sett_system.vaults['native.digg']]: {
					name: '',
					address: deploy.sett_system.strategies['native.digg'],
					fees: {
						['DAO Performance Fee']: new BigNumber(0),
						['Strategist Performance Fee']: new BigNumber(0),
						['Withdraw Fee']: new BigNumber(0),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#b63c02c4f27f43229624da8abb377be2',
				},
				[deploy.sett_system.vaults['native.uniDiggWbtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.uniDiggWbtc'],
					fees: {
						['DAO Performance Fee']: new BigNumber(0),
						['Strategist Performance Fee']: new BigNumber(0),
						['Withdraw Fee']: new BigNumber(0),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#e6043ad7d2a94df39eee74a235f3faf8',
				},
				[deploy.sett_system.vaults['native.sushiDiggWbtc']]: {
					name: '',
					address: deploy.sett_system.strategies['native.sushiDiggWbtc'],
					fees: {
						['DAO Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(0),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#e1a46fc7a95d4f73b586435f45586748',
				},
				[deploy.sett_system.vaults['yearn.wBtc']]: {
					name: '',
					address: deploy.sett_system.vaults['yearn.wBtc'],
					fees: {
						['Yearn Performance Fee']: new BigNumber(2000),
						['Yearn Management Fee']: new BigNumber(200),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#8dbbd221e429409db3b487da966a14b8',
				},
				[deploy.sett_system.vaults['native.sushiibBTCwBTC']]: {
					name: '',
					address: deploy.sett_system.vaults['native.sushiibBTCwBTC'],
					fees: {
						['DAO Performance Fee']: new BigNumber(1000),
						['Strategist Performance Fee']: new BigNumber(1000),
						['Withdraw Fee']: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/Strategies',
				},
			};
	}
};
