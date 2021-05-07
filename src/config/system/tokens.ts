import { ERC20, BSC_ERC20, NETWORK_LIST } from 'config/constants';
import deploy from '../deployments/mainnet.json';
import bscDeploy from '../deployments/bsc.json';
import { AbiItem } from 'web3-utils';
import { TokenNetworkConfig } from 'mobx/model';

export const getTokens = (network?: string | null): TokenNetworkConfig => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return {
				priceEndpoints: ['https://api.thegraph.com/subgraphs/name/pancakeswap/exchange'],
				tokenBatches: [
					{
						abi: BSC_ERC20.abi as AbiItem[],
						methods: [
							{
								name: 'totalSupply',
							},
							{
								name: 'balanceOf',
								args: ['{connectedAddress}'],
							},
						],
						contracts: [
							bscDeploy.tokens.badger,
							bscDeploy.tokens.bBadger,
							bscDeploy.tokens.bDigg,
							bscDeploy.tokens.BTCB,
							bscDeploy.tokens.BNB,
							bscDeploy.tokens.CAKE,
							bscDeploy.tokens['pancake.BTCB-BNB'],
							bscDeploy.tokens['pancake.bBADGER-BTCB'],
							bscDeploy.tokens['pancake.bDIGG-BTCB'],
							bscDeploy.test.assets['yearn.test'],
						],
					},
				],
				decimals: {
					[bscDeploy.tokens.badger]: 18,
					[bscDeploy.tokens.bBadger]: 18,
					[bscDeploy.tokens.bDigg]: 18,
					[bscDeploy.tokens['pancake.BTCB-BNB']]: 18,
					[bscDeploy.tokens.BTCB]: 18,
					[bscDeploy.tokens.BNB]: 18,
					[bscDeploy.tokens.CAKE]: 18,
					[bscDeploy.tokens['pancake.bBADGER-BTCB']]: 18,
					[bscDeploy.tokens['pancake.bDIGG-BTCB']]: 18,
					[bscDeploy.test.assets['yearn.test']]: 18,
				},
				symbols: {
					[bscDeploy.tokens.badger]: 'BADGER',
					[bscDeploy.tokens.bBadger]: 'bBADGER',
					[bscDeploy.tokens.bDigg]: 'bDigg',
					[bscDeploy.tokens['pancake.BTCB-BNB']]: 'BNB/BTCb CAKE-LP',
					[bscDeploy.tokens.BTCB]: 'BTCb',
					[bscDeploy.tokens.BNB]: 'BNB',
					[bscDeploy.tokens.CAKE]: 'CAKE',
					[bscDeploy.tokens['pancake.bBADGER-BTCB']]: 'bBADGER/BTCb CAKE-LP',
					[bscDeploy.tokens['pancake.bDIGG-BTCB']]: 'bDIGG/BTCb CAKE-LP',
					[bscDeploy.test.assets['yearn.test']]: 'TEST',
				},
				names: {
					[bscDeploy.tokens['pancake.BTCB-BNB']]: 'BNB/BTCb Pancake LP',
					[bscDeploy.tokens.badger]: 'Badger',
					[bscDeploy.tokens.bBadger]: 'bBadger',
					[bscDeploy.tokens.bDigg]: 'bDigg',
					[bscDeploy.tokens.BTCB]: 'BTCb',
					[bscDeploy.tokens.BNB]: 'BNB',
					[bscDeploy.tokens.CAKE]: 'Pancakeswap Token',
					[bscDeploy.tokens['pancake.bBADGER-BTCB']]: 'bBadger/BTCb Pancake LP',
					[bscDeploy.tokens['pancake.bDIGG-BTCB']]: 'bBadger/BTCb Pancake LP',
					[bscDeploy.test.assets['yearn.test']]: 'Yearn Test Token',
				},
				tokenMap: {
					[bscDeploy.sett_system.vaults['native.pancakeBnbBtcb']]: bscDeploy.tokens['pancake.BTCB-BNB'],
					[bscDeploy.sett_system.vaults['native.bBadgerBtcb']]: bscDeploy.tokens['pancake.bBADGER-BTCB'],
					[bscDeploy.sett_system.vaults['native.bDiggBtcb']]: bscDeploy.tokens['pancake.bDIGG-BTCB'],
					[bscDeploy.sett_system.vaults['yearn.wBtc']]: bscDeploy.test.assets['yearn.test'],
				},
			};
		case NETWORK_LIST.ETH:
			return {
				curveTokens: {
					contracts: [
						deploy.tokens['curve.renWBTC'],
						deploy.tokens['curve.tBTC-sBTC'],
						deploy.tokens['curve.renWSBTC'],
					],
					priceEndpoints: [
						'https://stats.curve.fi/raw-stats/ren2-1440m.json',
						'https://stats.curve.fi/raw-stats/tbtc-1440m.json',
						'https://stats.curve.fi/raw-stats/rens-1440m.json',
					],
					names: ['Curve.fi renBTC/wBTC', 'Curve.fi tBTC/sbtcCrv', 'Curve.fi renBTC/wBTC/sBTC'],
					vsToken: deploy.tokens.wBTC,
				},
				priceEndpoints: [
					'https://api.thegraph.com/subgraphs/name/jiro-ono/sushiswap-v1-exchange',
					'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
				],
				tokenBatches: [
					{
						abi: ERC20.abi as AbiItem[],
						methods: [
							{
								name: 'totalSupply',
							},
							{
								name: 'balanceOf',
								args: ['{connectedAddress}'],
							},
						],
						contracts: [
							deploy.tokens.sushi,
							deploy.sett_system.vaults['native.renCrv'],
							deploy.tokens['sushi.wBTC-DIGG'],
							deploy.sett_system.vaults['native.badger'],
							deploy.tokens['sushi.xSushi-WETH'],
							deploy.tokens['curve.tBTC-sBTC'],
							deploy.tokens['curve.renWSBTC'],
							deploy.sett_system.vaults['native.uniBadgerWbtc'],
							deploy.sett_system.vaults['native.sushiWbtcEth'],
							deploy.tokens.digg,
							deploy.sett_system.vaults['native.sushiBadgerWbtc'],
							deploy.tokens.wBTC,
							deploy.tokens.badger,
							deploy.tokens['curve.renWBTC'],
							deploy.tokens['sushi.wBTC-BADGER'],
							deploy.sett_system.vaults['harvest.renCrv'],
							deploy.sett_system.vaults['native.tbtcCrv'],
							deploy.tokens['uni.wBTC-BADGER'],
							deploy.tokens['sushi.wBTC-WETH'],
							deploy.sett_system.vaults['native.sbtcCrv'],
							deploy.tokens['uni.wBTC-DIGG'],
							deploy.sett_system.vaults['native.sushiDiggWbtc'],
							deploy.tokens.xsushi,
						],
					},
				],
				decimals: {
					[deploy.tokens.sushi]: 18,
					[deploy.sett_system.vaults['native.renCrv']]: 18,
					[deploy.tokens['sushi.wBTC-DIGG']]: 18,
					[deploy.sett_system.vaults['native.badger']]: 18,
					[deploy.tokens['sushi.xSushi-WETH']]: 18,
					[deploy.tokens['curve.tBTC-sBTC']]: 18,
					[deploy.tokens['curve.renWSBTC']]: 18,
					[deploy.sett_system.vaults['native.uniBadgerWbtc']]: 18,
					[deploy.sett_system.vaults['native.sushiWbtcEth']]: 18,
					[deploy.tokens.digg]: 9,
					[deploy.sett_system.vaults['native.sushiBadgerWbtc']]: 18,
					[deploy.tokens.wBTC]: 8,
					[deploy.tokens.badger]: 18,
					[deploy.tokens['curve.renWBTC']]: 18,
					[deploy.tokens['sushi.wBTC-BADGER']]: 18,
					[deploy.sett_system.vaults['harvest.renCrv']]: 18,
					[deploy.sett_system.vaults['native.tbtcCrv']]: 18,
					[deploy.tokens['uni.wBTC-BADGER']]: 18,
					[deploy.tokens['sushi.wBTC-WETH']]: 18,
					[deploy.sett_system.vaults['native.sbtcCrv']]: 18,
					[deploy.tokens['uni.wBTC-DIGG']]: 18,
					[deploy.sett_system.vaults['native.sushiDiggWbtc']]: 18,
					[deploy.tokens.xsushi]: 18,
					[deploy.sett_system.vaults['yearn.wBtc']]: 8,
					[deploy.tokens.ibBTC]: 18,
					[deploy.tokens['sushi.ibBTC-wBTC']]: 18,
				},
				symbols: {
					[deploy.tokens.sushi]: 'SUSHI',
					[deploy.tokens['sushi.wBTC-DIGG']]: 'wbtcDiggSLP',
					[deploy.tokens['sushi.xSushi-WETH']]: 'xSushiWethSLP',
					[deploy.tokens['curve.tBTC-sBTC']]: 'tbtc/sbtcCrv',
					[deploy.tokens['curve.renWSBTC']]: 'crvRenWSBTC',
					[deploy.tokens.digg]: 'DIGG',
					[deploy.tokens.wBTC]: 'WBTC',
					[deploy.tokens.badger]: 'BADGER',
					[deploy.tokens['curve.renWBTC']]: 'crvRenWBTC',
					[deploy.tokens['sushi.wBTC-BADGER']]: 'wbtcBadgerSLP',
					[deploy.tokens['uni.wBTC-BADGER']]: 'wbtcBadgerUNI-V2',
					[deploy.tokens['sushi.wBTC-WETH']]: 'wbtcWethSLP',
					[deploy.tokens['uni.wBTC-DIGG']]: 'wbtcDiggUNI-V2',
					[deploy.tokens.xsushi]: 'xSUSHI',
					[deploy.tokens.ibBTC]: 'ibBTC',
					[deploy.tokens['sushi.ibBTC-wBTC']]: 'ibBTCwBTCSLP',

					[deploy.sett_system.vaults['native.renCrv']]: 'bcrvRenWBTC',
					[deploy.sett_system.vaults['native.badger']]: 'bBADGER',
					[deploy.sett_system.vaults['native.uniBadgerWbtc']]: 'bUNI-V2',
					[deploy.sett_system.vaults['native.sushiWbtcEth']]: 'bSLP',
					[deploy.sett_system.vaults['native.sushiBadgerWbtc']]: 'bSLP',
					[deploy.sett_system.vaults['native.sushiDiggWbtc']]: 'bSLP',
					[deploy.sett_system.vaults['harvest.renCrv']]: 'bSupercrvRenWBTC',
					[deploy.sett_system.vaults['native.tbtcCrv']]: 'btbtc/sbtcCrv',
					[deploy.sett_system.vaults['native.sbtcCrv']]: 'bcrvRenWSBTC',
					[deploy.sett_system.vaults['yearn.wBtc']]: 'byvWBTC',
					[deploy.sett_system.vaults['native.sushiibBTCwBTC']]: 'bibBTCwBTC',
				},
				names: {
					[deploy.tokens.sushi]: 'SUSHI',
					[deploy.tokens['sushi.wBTC-DIGG']]: 'wBTC/DIGG Sushi LP',
					[deploy.tokens['uni.wBTC-DIGG']]: 'wBTC/DIGG Uni LP',
					[deploy.tokens['sushi.xSushi-WETH']]: 'xSUSHI/wETH Sushi LP',
					[deploy.tokens['curve.tBTC-sBTC']]: 'Curve.fi tBTC/sBTCCrv LP',
					[deploy.tokens['curve.renWSBTC']]: 'Curve.fi crvRenWSBTC',
					[deploy.tokens.digg]: 'Digg',
					[deploy.tokens.wBTC]: 'Wrapped Bitcoin',
					[deploy.tokens.badger]: 'Badger',
					[deploy.tokens['curve.renWBTC']]: 'Curve.fi crvRenWBTC',
					[deploy.tokens['sushi.wBTC-BADGER']]: 'wBTC/Badger Sushi LP',
					[deploy.tokens['uni.wBTC-BADGER']]: 'wBTC/Badger Uni LP',
					[deploy.tokens['sushi.wBTC-WETH']]: 'wBTC/wETH Sushi LP',
					[deploy.tokens.xsushi]: 'xSUSHI',
					[deploy.tokens.ibBTC]: 'ibBTC',

					[deploy.sett_system.vaults['native.renCrv']]: 'bcrvRenWBTC',
					[deploy.sett_system.vaults['native.badger']]: 'bBADGER',
					[deploy.sett_system.vaults['native.uniBadgerWbtc']]: 'bUNI-V2',
					[deploy.sett_system.vaults['native.sushiWbtcEth']]: 'bSLP',
					[deploy.sett_system.vaults['native.sushiBadgerWbtc']]: 'bSLP',
					[deploy.sett_system.vaults['native.sushiDiggWbtc']]: 'bSLP',
					[deploy.sett_system.vaults['harvest.renCrv']]: 'bSupercrvRenWBTC',
					[deploy.sett_system.vaults['native.tbtcCrv']]: 'btbtc/sbtcCrv',
					[deploy.sett_system.vaults['native.sbtcCrv']]: 'bcrvRenWSBTC',
					[deploy.sett_system.vaults['yearn.wBtc']]: 'byvWBTC',
				},
				tokenMap: {
					[deploy.sett_system.vaults['native.sushiDiggWbtc']]: deploy.tokens['sushi.wBTC-DIGG'],
					[deploy.sett_system.vaults['native.sbtcCrv']]: deploy.tokens['curve.renWSBTC'],
					[deploy.sett_system.vaults['native.digg']]: deploy.tokens.digg,
					[deploy.sett_system.vaults['native.badger']]: deploy.tokens.badger,
					[deploy.sett_system.vaults['harvest.renCrv']]: deploy.tokens['curve.renWBTC'],
					[deploy.sett_system.vaults['native.renCrv']]: deploy.tokens['curve.renWBTC'],
					[deploy.sett_system.vaults['native.sushiBadgerWbtc']]: deploy.tokens['sushi.wBTC-BADGER'],
					[deploy.sett_system.vaults['native.uniBadgerWbtc']]: deploy.tokens['uni.wBTC-BADGER'],
					[deploy.sett_system.vaults['native.sushiWbtcEth']]: deploy.tokens['sushi.wBTC-WETH'],
					[deploy.sett_system.vaults['native.uniDiggWbtc']]: deploy.tokens['uni.wBTC-DIGG'],
					[deploy.sett_system.vaults['native.tbtcCrv']]: deploy.tokens['curve.tBTC-sBTC'],
					[deploy.sett_system.vaults['yearn.wBtc']]: deploy.tokens.wBTC,
					[deploy.sett_system.vaults['native.sushiibBTCwBTC']]: deploy.tokens['sushi.ibBTC-wBTC'],
				},
			};
		default:
			return {
				priceEndpoints: [],
				tokenBatches: [],
				decimals: {},
				symbols: {},
				names: {},
				tokenMap: {},
			};
	}
};
