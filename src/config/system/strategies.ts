import BigNumber from 'bignumber.js';
import { StrategyNetworkConfig } from '../../mobx/model/strategies/strategy-network-config';
import { StrategyFee } from '../../mobx/model/system-config/stategy-fees';
import arbitrumDeploy from '../../config/deployments/arbitrum.json';
import maticDeploy from '../../config/deployments/matic.json';
import bscDeploy from '../../config/deployments/bsc.json';
import ethDeploy from '../../config/deployments/mainnet.json';
import avaxDeploy from '../../config/deployments/avalanche.json';
import fantomDeploy from '../../config/deployments/ftm.json';
import { Network } from '@badger-dao/sdk';

// TODO: add descriptions and deposit instructions after marketing team provides them
export const getStrategies = (network: Network): StrategyNetworkConfig => {
	switch (network) {
		case Network.Fantom:
			return {
				[fantomDeploy.sett_system.vaults['native.wbtc-renbtc']]: {
					address: fantomDeploy.sett_system.strategies['native.wbtc-renbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-renbtc-wbtc-lp',
				},
				[fantomDeploy.sett_system.vaults['native.wftm-sex']]: {
					address: fantomDeploy.sett_system.strategies['native.wftm-sex'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-sex-wftm-lp',
				},
				[fantomDeploy.sett_system.vaults['native.solid-solidsex']]: {
					address: fantomDeploy.sett_system.strategies['native.solid-solidsex'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-solid-solidsex-lp',
				},
				[fantomDeploy.sett_system.vaults['native.weve-usdc']]: {
					address: fantomDeploy.sett_system.strategies['native.weve-usdc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1500),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-weve-usdc-lp',
				},
				[fantomDeploy.sett_system.vaults['native.oxd-usdc']]: {
					address: fantomDeploy.sett_system.strategies['native.oxd-usdc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1500),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					// TODO: Update user guide
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-avalanche/arbitrum-sushi-weth-helper-vault',
				},
				[fantomDeploy.sett_system.vaults['native.wftm-crv']]: {
					address: fantomDeploy.sett_system.strategies['native.wftm-crv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1500),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-wftm-crv-lp',
				},
				[fantomDeploy.sett_system.vaults['native.usdc-mim']]: {
					address: fantomDeploy.sett_system.strategies['native.usdc-mim'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1500),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-mim-usdc-lp',
				},
				[fantomDeploy.sett_system.vaults['native.wftm-renbtc']]: {
					address: fantomDeploy.sett_system.strategies['native.wftm-renbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1500),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-wftm-renbtc-lp',
				},
				[fantomDeploy.sett_system.vaults['native.boo-xboo-eco']]: {
					address: fantomDeploy.sett_system.strategies['native.boo-xboo-eco'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-boo-xboo-lp-solidex-ecosystem',
				},
				[fantomDeploy.sett_system.vaults['native.wftm-crv-eco']]: {
					address: fantomDeploy.sett_system.strategies['native.wftm-crv-eco'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-wftm-crv-lp-solidex-ecosystem',
				},
				[fantomDeploy.sett_system.vaults['native.usdc-mim-eco']]: {
					address: fantomDeploy.sett_system.strategies['native.usdc-mim-eco'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-mim-usdc-lp-solidex-ecosystem',
				},
				[fantomDeploy.sett_system.vaults['native.wftm-scream-eco']]: {
					address: fantomDeploy.sett_system.strategies['native.wftm-scream-eco'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-scream-wftm-lp-solidex-ecosystem',
				},
				[fantomDeploy.sett_system.vaults['native.wftm-renbtc-eco']]: {
					address: fantomDeploy.sett_system.strategies['native.wftm-renbtc-eco'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-wftm-renbtc-lp-solidex-ecosystem',
				},
				[fantomDeploy.sett_system.vaults['native.wftm-tomb-eco']]: {
					address: fantomDeploy.sett_system.strategies['native.wftm-tomb-eco'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-tomb-wftm-lp-solidex-ecosystem',
				},
				[fantomDeploy.sett_system.vaults['native.geist-g3crv']]: {
					address: fantomDeploy.sett_system.strategies['native.geist-g3crv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-fantom/fantom-geist-g3crv-lp',
				},
			};
		case Network.Avalanche:
			return {
				[avaxDeploy.sett_system.vaults['BWBTC']]: {
					address: avaxDeploy.sett_system.strategies['BWBTC'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					// TODO: Update user guide
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-avalanche/arbitrum-sushi-weth-helper-vault',
				},
			};
		case Network.Arbitrum:
			return {
				[arbitrumDeploy.sett_system.vaults['native.sushiWethSushi']]: {
					address: arbitrumDeploy.sett_system.strategies['native.sushiWethSushi'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-sushi-weth-helper-vault',
					depositLink: 'https://app.sushi.com/add/ETH/0xd4d42F0b6DEF4CE0383636770eF773390d85c61A',
				},
				[arbitrumDeploy.sett_system.vaults['native.sushiWethWbtc']]: {
					address: arbitrumDeploy.sett_system.strategies['native.sushiWethWbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-wbtc-eth-slp',
					depositLink: 'https://app.sushi.com/add/ETH/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
				},
				[arbitrumDeploy.sett_system.vaults['native.crvWbtcRen']]: {
					address: arbitrumDeploy.sett_system.strategies['native.crvWbtcRen'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-renbtc-wbtc',
					depositLink: 'https://arbitrum.curve.fi/ren/deposit',
				},
				[arbitrumDeploy.sett_system.vaults['native.tricrypto']]: {
					address: arbitrumDeploy.sett_system.strategies['native.tricrypto'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-tricrypto2',
					depositLink: 'https://arbitrum.curve.fi/tricrypto/deposit',
				},
				[arbitrumDeploy.sett_system.vaults['native.swaprWethSwapr']]: {
					address: arbitrumDeploy.sett_system.strategies['native.swaprWethSwapr'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-swapr-weth-helper-vault',
					depositLink:
						'https://swapr.eth.link/#/add/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/0xdE903E2712288A1dA82942DDdF2c20529565aC30?chainId=42161',
				},
				[arbitrumDeploy.sett_system.vaults['native.tricryptoLight']]: {
					address: arbitrumDeploy.sett_system.strategies['native.tricryptoLight'],
					fees: {
						[StrategyFee.performance]: new BigNumber(350),
						[StrategyFee.strategistPerformance]: new BigNumber(350),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://app.gitbook.com/@badger-finance/s/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-tricrypto-crv',
					depositLink: 'https://arbitrum.curve.fi/tricrypto/deposit',
				},
				[arbitrumDeploy.sett_system.vaults['native.swaprWethWbtc']]: {
					address: arbitrumDeploy.sett_system.strategies['native.swaprWethWbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-wbtc-weth',
					depositLink:
						'https://swapr.eth.link/#/add/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f/ETH?chainId=42161',
				},
				[arbitrumDeploy.sett_system.vaults['native.swaprWethBadger']]: {
					address: arbitrumDeploy.sett_system.strategies['native.swaprWethBadger'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-badger-weth',
					depositLink:
						'https://swapr.eth.link/#/add/ETH/0xBfa641051Ba0a0Ad1b0AcF549a89536A0D76472E?chainId=42161',
				},
				[arbitrumDeploy.sett_system.vaults['native.swaprWethIbbtc']]: {
					address: arbitrumDeploy.sett_system.strategies['native.swaprWethIbbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-ibbtc-weth',
					depositLink:
						'https://swapr.eth.link/#/add/ETH/0x9Ab3FD50FcAe73A1AEDa959468FD0D662c881b42?chainId=42161',
				},
			};
		case Network.Polygon:
			return {
				[maticDeploy.sett_system.vaults['BSLP-IBBTC-WBTC']]: {
					address: maticDeploy.sett_system.strategies['BSLP-IBBTC-WBTC'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					depositLink:
						'https://app.sushi.com/add/0x4EaC4c4e9050464067D673102F8E24b2FccEB350/0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-polygon/polygon-wbtc-ibbtc-slp',
				},
				[maticDeploy.sett_system.vaults['BQLP-WBTC-USDC']]: {
					address: maticDeploy.sett_system.strategies['BQLP-WBTC-USDC'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					depositLink:
						'https://quickswap.exchange/#/add/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-polygon/polygon-wbtc-usdc-qlp',
				},
				[maticDeploy.sett_system.vaults['BCRV-WBTC-RENBTC']]: {
					address: maticDeploy.sett_system.strategies['BCRV-WBTC-RENBTC'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					depositLink: 'https://polygon.curve.fi/ren/deposit',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-polygon/polygon-amwbtc-renwbtc',
				},
			};
		case Network.BinanceSmartChain:
			return {
				[bscDeploy.sett_system.vaults['native.pancakeBnbBtcb']]: {
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
					address: bscDeploy.sett_system.strategies['native.bBadgerBtcb'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#d40fae9575c641d7a875069c6fb7f2ad',
				},
				[bscDeploy.sett_system.vaults['native.bDiggBtcb']]: {
					address: bscDeploy.sett_system.strategies['native.bDiggBtcb'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink:
						'https://badger.wiki/Strategies-7bf5b27a451242538f02855ca5aaf4e4#7367ef32aedf4a1dae8697dfc170d7f3',
				},
			};
		default:
			return {
				[ethDeploy.sett_system.vaults['native.badger']]: {
					address: ethDeploy.sett_system.strategies['native.badger'],
					fees: {
						[StrategyFee.performance]: new BigNumber(0),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#fe02e2fa6ea446ca9b975d1eecf3120c',
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/badger',
					depositLink:
						'https://app.sushi.com/swap?inputCurrency=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599&outputCurrency=0x3472A5A71965499acd81997a54BBA8D852C6E53d',
				},
				[ethDeploy.sett_system.vaults['native.rembadger']]: {
					// rembadger has no strategy, this is not used anyway - @jintao
					address: ethDeploy.sett_system.strategies['native.badger'],
					fees: {
						[StrategyFee.performance]: new BigNumber(0),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/rembadger',
				},
				[ethDeploy.sett_system.vaults['native.renCrv']]: {
					address: ethDeploy.sett_system.strategies['native.renCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#2304f0f6a0684aee82853f9635211ec9',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/convex-renbtc-wbtc',
					depositLink: 'https://curve.fi/ren/deposit',
				},
				[ethDeploy.sett_system.vaults['native.sbtcCrv']]: {
					address: ethDeploy.sett_system.strategies['native.sbtcCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#ce634a6ad4b0486288180d775a1552ab',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/convex-renbtc-wbtc-sbtc',
					depositLink: 'https://curve.fi/sbtc/deposit',
				},
				[ethDeploy.sett_system.vaults['native.tbtcCrv']]: {
					address: ethDeploy.sett_system.strategies['native.tbtcCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#cba0515b901e423d892f9c0cf66b272f',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/convex-tbtc-sbtc',
					depositLink: 'https://curve.fi/tbtc/deposit',
				},
				[ethDeploy.sett_system.vaults['native.uniBadgerWbtc']]: {
					address: ethDeploy.sett_system.strategies['native.uniBadgerWbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(0),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#9da96d000b3e49cc92f04a49dd08a9bd',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/wrapped-btc-badger-uniswap-lp',
					depositLink:
						'https://app.uniswap.org/#/add/v2/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/0x3472A5A71965499acd81997a54BBA8D852C6E53d',
				},
				[ethDeploy.sett_system.vaults['harvest.renCrv']]: {
					address: ethDeploy.sett_system.strategies['harvest.renCrv'],
					fees: {
						[StrategyFee.harvestPerformance]: new BigNumber(1000),
						[StrategyFee.harvestStrategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/harvest-renbtc-wbtc',
					userGuide:
						'https://app.gitbook.com/@badger-finance/s/badger-finance/v/master/sett-user-guides/harvest-renbtc-wbtc',
				},
				[ethDeploy.sett_system.vaults['native.sushiWbtcEth']]: {
					// description:
					// 	'Provide liquidity in Sushiswap WBTC/ETH pool and receive SLP tokens in return, which ' +
					// 	'represent your share of the pair. Deposit your SLP tokens in Badger protocol and get bSLP ' +
					// 	'tokens in return. 50% of rewards are automatically compounded as the bSLP/LP ratio increases ' +
					// 	'over time. LP tokens are deposited in Sushiswap’s Onsen. DIGG and xSushi incentive rewards ' +
					// 	'can be claimed in the dashboard.',
					address: ethDeploy.sett_system.strategies['native.sushiWbtcEth'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#2f5ee4a857754023af1fdba144a0c1be',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/wrapped-btc-wrapped-ether-slp',
					depositLink: 'https://app.sushi.com/add/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/ETH',
				},
				[ethDeploy.sett_system.vaults['native.sushiBadgerWbtc']]: {
					address: ethDeploy.sett_system.strategies['native.sushiBadgerWbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#46bfa12ac9d24b9bb7d28d1f9bc3256a',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/wrapped-btc-badger-slp',
					depositLink:
						'https://app.sushi.com/add/0x3472A5A71965499acd81997a54BBA8D852C6E53d/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				},
				[ethDeploy.sett_system.vaults['native.digg']]: {
					address: ethDeploy.sett_system.strategies['native.digg'],
					fees: {
						[StrategyFee.performance]: new BigNumber(0),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#b63c02c4f27f43229624da8abb377be2',
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/digg',
					depositLink:
						'https://app.sushi.com/swap?inputCurrency=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599&outputCurrency=0x798D1bE841a82a273720CE31c822C61a67a601C3',
				},
				[ethDeploy.sett_system.vaults['native.uniDiggWbtc']]: {
					address: ethDeploy.sett_system.strategies['native.uniDiggWbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(0),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/digg-wbtc-uniswap-lp',
				},
				[ethDeploy.sett_system.vaults['native.sushiDiggWbtc']]: {
					address: ethDeploy.sett_system.strategies['native.sushiDiggWbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#e1a46fc7a95d4f73b586435f45586748',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/wrapped-btc-digg-SLP',
					depositLink:
						'https://app.sushi.com/add/0x798D1bE841a82a273720CE31c822C61a67a601C3/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				},
				[ethDeploy.sett_system.vaults['yearn.wBtc']]: {
					address: ethDeploy.sett_system.strategies['yearn.wBtc'],
					fees: {
						[StrategyFee.yearnPerformance]: new BigNumber(2000),
						[StrategyFee.yearnManagement]: new BigNumber(200),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					strategyLink: 'https://badger.wiki/strategies#8dbbd221e429409db3b487da966a14b8',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/yearn-wrapped-btc',
				},
				[ethDeploy.sett_system.vaults['native.sushiibBTCwBTC']]: {
					address: ethDeploy.sett_system.strategies['experimental.sushiIBbtcWbtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.strategistPerformance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(20),
					},
					strategyLink: 'https://badger.wiki/strategies#418b98a05da849a3a8dd97f74f8c0c80',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/wrapped-btc-ibbtc-slp',
					depositLink:
						'https://app.sushi.com/add/0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
				},
				[ethDeploy.sett_system.vaults['experimental.digg']]: {
					address: ethDeploy.sett_system.strategies['experimental.digg'],
					fees: {
						[StrategyFee.performance]: new BigNumber(250),
						[StrategyFee.strategistPerformance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					depositLink:
						'https://app.sushi.com/swap?inputCurrency=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599&outputCurrency=0x798D1bE841a82a273720CE31c822C61a67a601C3',
				},
				[ethDeploy.sett_system.vaults['native.mim-3crv']]: {
					address: ethDeploy.sett_system.strategies['native.mim-3crv'],
					fees: {
						[StrategyFee.strategistPerformance]: new BigNumber(2000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/mim-3crv-curve-lp',
					depositLink: 'https://curve.fi/mim/deposit',
					strategyLink: 'https://badger.wiki/strategies#691cfc90b4a6453da20ac3a37aca1ab1',
				},
				[ethDeploy.sett_system.vaults['native.frax-3crv']]: {
					address: ethDeploy.sett_system.strategies['native.frax-3crv'],
					fees: {
						[StrategyFee.strategistPerformance]: new BigNumber(2000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/frax-3crv-curve-lp',
					depositLink: 'https://curve.fi/frax/deposit',
					strategyLink: 'https://badger.wiki/strategies#570fcd8b773242a9bc22c1b4c53dcb60',
				},
				[ethDeploy.sett_system.vaults['native.hbtcCrv']]: {
					address: ethDeploy.sett_system.strategies['native.hbtcCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#56cd7b65cd384740aa9f339bf3ee2597',
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/convex-hbtc',
					depositLink: 'https://curve.fi/hbtc/deposit',
				},
				[ethDeploy.sett_system.vaults['native.pbtcCrv']]: {
					address: ethDeploy.sett_system.strategies['native.pbtcCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#39a0decd933b4869b98c9276118b9d39',
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/convex-pbtc',
					depositLink: 'https://curve.fi/pbtc/deposit',
				},
				[ethDeploy.sett_system.vaults['native.obtcCrv']]: {
					address: ethDeploy.sett_system.strategies['native.obtcCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#82d72e94cb3b49f0836d8197ad13bc36',
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/convex-obtc',
					depositLink: 'https://curve.fi/obtc/deposit',
				},
				[ethDeploy.sett_system.vaults['native.bbtcCrv']]: {
					address: ethDeploy.sett_system.strategies['native.bbtcCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#fe4a64edc830472da5a700d0fc30716c',
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/convex-bbtc',
					depositLink: 'https://curve.fi/bbtc/deposit',
				},
				[ethDeploy.sett_system.vaults['native.tricryptoCrv']]: {
					address: ethDeploy.sett_system.strategies['native.tricrypto'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(0),
					},
					strategyLink: 'https://badger.wiki/strategies#f03b01a576d241aa9d9cee153876c976',
				},
				[ethDeploy.sett_system.vaults['native.tricryptoCrv2']]: {
					address: ethDeploy.sett_system.strategies['native.tricrypto2'],
					fees: {
						[StrategyFee.performance]: new BigNumber(2000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#d5806054c232432e8e8a1d75ae329bf8',
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/tricrypto2',
					depositLink: 'https://curve.fi/tricrypto2/deposit',
				},
				[ethDeploy.sett_system.vaults['native.cvxCrv']]: {
					address: ethDeploy.sett_system.strategies['native.cvxCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					strategyLink: 'https://badger.wiki/strategies#51d48102bc4847a6a5a1a059c4b827b3',
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/cvxcrv-helper',
				},
				[ethDeploy.sett_system.vaults['native.cvx']]: {
					address: ethDeploy.sett_system.strategies['native.cvx'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					strategyLink: 'https://badger.wiki/strategies#1346adfaad7946eebd29a17fb4f6e8b7',
					userGuide: 'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/cvx-helper',
				},
				[ethDeploy.sett_system.vaults['native.icvx']]: {
					address: ethDeploy.sett_system.strategies['native.icvx'],
					fees: {
						[StrategyFee.performance]: new BigNumber(0),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					depositLink:
						'https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
					userGuide: 'https://docs.badger.com/badger-finance/sett-user-guides/blcvx-locked-convex',
				},
				[ethDeploy.sett_system.vaults['native.imBtc']]: {
					address: ethDeploy.sett_system.strategies['native.imBtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#2234cf88bca941ce9450548c9eb96cec',
					depositLink: 'https://mstable.app/#/mbtc/save',
					userGuide: 'https://docs.badger.com/badger-finance/sett-user-guides/mstable-imbtc',
				},
				[ethDeploy.sett_system.vaults['native.fPmBtcHBtc']]: {
					address: ethDeploy.sett_system.strategies['native.fPmBtcHBtc'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					strategyLink: 'https://badger.wiki/strategies#9a88b07c857e42beab929d3f0e26ca1b',
					depositLink: 'https://mstable.app/#/mbtc/pools/0x48c59199da51b7e30ea200a74ea07974e62c4ba7',
					userGuide: 'https://docs.badger.com/badger-finance/sett-user-guides/mstable-mbtc-hbtc',
				},
				[ethDeploy.sett_system.vaults['native.bveCVXCVX']]: {
					address: ethDeploy.sett_system.strategies['native.bveCVXCVX'],
					fees: {
						[StrategyFee.performance]: new BigNumber(2000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					depositLink: 'https://curve.fi/factory/52/deposit',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/bvecvx-cvx-curve-lp',
				},
				[ethDeploy.sett_system.vaults['native.ibbtcCrv']]: {
					address: ethDeploy.sett_system.strategies['native.ibbtcCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(2000),
						[StrategyFee.withdraw]: new BigNumber(10),
					},
					depositLink: 'https://curve.fi/factory/60/deposit',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/ibbtc-sbtc-curve-lp',
				},
				[ethDeploy.sett_system.vaults['native.badgerCrv']]: {
					address: ethDeploy.sett_system.strategies['native.badgerCrv'],
					fees: {
						[StrategyFee.performance]: new BigNumber(1000),
						[StrategyFee.withdraw]: new BigNumber(50),
					},
					// TODO: update strategy link
					// strategyLink: 'https://badger.wiki/strategies#82d72e94cb3b49f0836d8197ad13bc36',
					userGuide:
						'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/convex-badger-wbtc',
					depositLink: 'https://curve.fi/factory-crypto/4/deposit',
				},
			};
	}
};
