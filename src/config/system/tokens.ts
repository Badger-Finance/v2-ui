import { ERC20, BSC_ERC20, NETWORK_LIST, NETWORK_CONSTANTS } from 'config/constants';
import deploy from '../deployments/mainnet.json';
import bscDeploy from '../deployments/bsc.json';
import { AbiItem } from 'web3-utils';
import { TokenNetworkConfig } from 'mobx/model';
import { zipObject } from '../../utils/lodashToNative';

export const getTokens = (network?: string | null): TokenNetworkConfig | undefined => {
	switch (network) {
		case NETWORK_LIST.BSC:
			const bscVaultList = [
				bscDeploy.sett_system.vaults['native.pancakeBnbBtcb'],
				bscDeploy.sett_system.vaults['native.bBadgerBtcb'],
				bscDeploy.sett_system.vaults['native.bDiggBtcb'],
			];
			const bscTokenList = [
				'0x7561EEe90e24F3b348E1087A005F78B4c8453524',
				'0x10F461CEAC7A17F59e249954Db0784d42EfF5DB5',
				'0xE1E33459505bB3763843a426F7Fd9933418184ae',
			];
			const bscTokenMap = zipObject(bscVaultList, bscTokenList);
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
							'0x753fbc5800a8C8e3Fb6DC6415810d627A387Dfc9', // BADGER
							'0x1F7216fdB338247512Ec99715587bb97BBf96eae', // bBADGER
							'0x5986D5c77c65e5801a5cAa4fAE80089f870A71dA', // bDigg
							'0x7561EEe90e24F3b348E1087A005F78B4c8453524', // bnbBtc Cake LP
							'0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCb
							'0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // BNB
							'0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
							'0x10F461CEAC7A17F59e249954Db0784d42EfF5DB5', // bBadger/BTCb Cake LP
							'0xE1E33459505bB3763843a426F7Fd9933418184ae', // bDIGG/BTCb Cake LP
						],
					},
				],
				decimals: {
					'0x753fbc5800a8C8e3Fb6DC6415810d627A387Dfc9': 18, // BADGER
					'0x1F7216fdB338247512Ec99715587bb97BBf96eae': 18, // bBADGER
					'0x5986D5c77c65e5801a5cAa4fAE80089f870A71dA': 18, // bDigg
					'0x7561EEe90e24F3b348E1087A005F78B4c8453524': 18, // bnbBtc Cake LP
					'0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c': 18, // BTCb
					'0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': 18, // BNB
					'0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82': 18, // CAKE
					'0x10F461CEAC7A17F59e249954Db0784d42EfF5DB5': 18, // bBadger/BTCb Cake LP
					'0xE1E33459505bB3763843a426F7Fd9933418184ae': 18, // bDIGG/BTCb Cake LP
				},
				symbols: {
					'0x753fbc5800a8C8e3Fb6DC6415810d627A387Dfc9': 'BADGER', // BADGER
					'0x1F7216fdB338247512Ec99715587bb97BBf96eae': 'bBADGER', // bBADGER
					'0x5986D5c77c65e5801a5cAa4fAE80089f870A71dA': 'bDigg', // bDigg
					'0x7561EEe90e24F3b348E1087A005F78B4c8453524': 'BNB/BTCb CAKE-LP', // bnbBtc Cake LP
					'0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c': 'BTCb', // BTCb
					'0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': 'BNB', // BNB
					'0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82': 'CAKE', // CAKE
					'0x10F461CEAC7A17F59e249954Db0784d42EfF5DB5': 'bBADGER/BTCb CAKE-LP', // bBadger/BTCb Cake LP
					'0xE1E33459505bB3763843a426F7Fd9933418184ae': 'bDIGG/BTCb CAKE-LP', // bDIGG/BTCb Cake LP
				},
				names: {
					'0x7561EEe90e24F3b348E1087A005F78B4c8453524': 'BNB/BTCb Pancake LP',
					'0x753fbc5800a8C8e3Fb6DC6415810d627A387Dfc9': 'Badger',
					'0x1F7216fdB338247512Ec99715587bb97BBf96eae': 'bBadger',
					'0x5986D5c77c65e5801a5cAa4fAE80089f870A71dA': 'bDigg',
					'0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c': 'BTCb',
					'0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': 'BNB',
					'0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82': 'Pancakeswap Token',
					'0x10F461CEAC7A17F59e249954Db0784d42EfF5DB5': 'bBadger/BTCb Pancake LP', // bBadger/BTCb Cake LP
					'0xE1E33459505bB3763843a426F7Fd9933418184ae': 'bBadger/BTCb Pancake LP', // bDIGG/BTCb Cake LP
				},
				tokenMap: bscTokenMap,
			};
		case NETWORK_LIST.ETH:
			const vaultList = [
				deploy.sett_system.vaults['native.sushiDiggWbtc'],
				deploy.sett_system.vaults['native.sbtcCrv'],
				deploy.sett_system.vaults['native.digg'],
				deploy.sett_system.vaults['native.badger'],
				deploy.sett_system.vaults['harvest.renCrv'],
				deploy.sett_system.vaults['native.renCrv'],
				deploy.sett_system.vaults['native.sushiBadgerWbtc'],
				deploy.sett_system.vaults['native.uniBadgerWbtc'],
				deploy.sett_system.vaults['native.sushiWbtcEth'],
				deploy.sett_system.vaults['native.uniDiggWbtc'],
				deploy.sett_system.vaults['native.tbtcCrv'],
			];
			const tokenList = [
				'0x9a13867048e01c663ce8Ce2fE0cDAE69Ff9F35E3',
				'0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
				'0x798D1bE841a82a273720CE31c822C61a67a601C3',
				'0x3472A5A71965499acd81997a54BBA8D852C6E53d',
				'0x49849C98ae39Fff122806C06791Fa73784FB3675',
				'0x49849C98ae39Fff122806C06791Fa73784FB3675',
				'0x110492b31c59716AC47337E616804E3E3AdC0b4a',
				'0xcD7989894bc033581532D2cd88Da5db0A4b12859',
				'0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58',
				'0xE86204c4eDDd2f70eE00EAd6805f917671F56c52',
				'0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
			];
			const tokenMap = zipObject(vaultList, tokenList);
			return {
				curveTokens: {
					contracts: [
						'0x49849C98ae39Fff122806C06791Fa73784FB3675', //renBTC/wBTC (crvRenWBTC)
						'0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd', //Curve.fi tBTC/sbtcCrv (tbtc/sbtc...)
						'0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3', //Curve.fi renBTC/wBTC/sBTC
					],
					priceEndpoints: [
						'https://stats.curve.fi/raw-stats/ren2-1440m.json',
						'https://stats.curve.fi/raw-stats/tbtc-1440m.json',
						'https://stats.curve.fi/raw-stats/rens-1440m.json',
					],
					names: ['Curve.fi renBTC/wBTC', 'Curve.fi tBTC/sbtcCrv', 'Curve.fi renBTC/wBTC/sBTC'],
					vsToken: NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.WBTC_ADDRESS,
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
							'0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
							'0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545',
							'0x9a13867048e01c663ce8Ce2fE0cDAE69Ff9F35E3',
							'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28',
							'0x36e2FCCCc59e5747Ff63a03ea2e5C0c2C14911e7',
							'0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
							'0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
							'0x235c9e24D3FB2FAFd58a2E49D454Fdcd2DBf7FF1',
							'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D',
							'0x798D1bE841a82a273720CE31c822C61a67a601C3',
							'0x1862A18181346EBd9EdAf800804f89190DeF24a5',
							'0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
							'0x3472A5A71965499acd81997a54BBA8D852C6E53d',
							'0x49849C98ae39Fff122806C06791Fa73784FB3675',
							'0x110492b31c59716AC47337E616804E3E3AdC0b4a',
							'0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87',
							'0xb9D076fDe463dbc9f915E5392F807315Bf940334',
							'0xcD7989894bc033581532D2cd88Da5db0A4b12859',
							'0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58',
							'0xd04c48A53c111300aD41190D63681ed3dAd998eC',
							'0xE86204c4eDDd2f70eE00EAd6805f917671F56c52',
							'0x88128580ACdD9c04Ce47AFcE196875747bF2A9f6',
							'0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
						],
					},
				],
				decimals: {
					'0x6B3595068778DD592e39A122f4f5a5cF09C90fE2': 18,
					'0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': 18,
					'0x9a13867048e01c663ce8Ce2fE0cDAE69Ff9F35E3': 18,
					'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': 18,
					'0x36e2FCCCc59e5747Ff63a03ea2e5C0c2C14911e7': 18,
					'0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd': 18,
					'0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3': 18,
					'0x235c9e24D3FB2FAFd58a2E49D454Fdcd2DBf7FF1': 18,
					'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': 18,
					'0x798D1bE841a82a273720CE31c822C61a67a601C3': 9,
					'0x1862A18181346EBd9EdAf800804f89190DeF24a5': 18,
					'0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 8,
					'0x3472A5A71965499acd81997a54BBA8D852C6E53d': 18,
					'0x49849C98ae39Fff122806C06791Fa73784FB3675': 18,
					'0x110492b31c59716AC47337E616804E3E3AdC0b4a': 18,
					'0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87': 18,
					'0xb9D076fDe463dbc9f915E5392F807315Bf940334': 18,
					'0xcD7989894bc033581532D2cd88Da5db0A4b12859': 18,
					'0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58': 18,
					'0xd04c48A53c111300aD41190D63681ed3dAd998eC': 18,
					'0xE86204c4eDDd2f70eE00EAd6805f917671F56c52': 18,
					'0x88128580ACdD9c04Ce47AFcE196875747bF2A9f6': 18,
					'0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272': 18,
				},
				symbols: {
					'0x6B3595068778DD592e39A122f4f5a5cF09C90fE2': 'SUSHI',
					'0x9a13867048e01c663ce8Ce2fE0cDAE69Ff9F35E3': 'wbtcDiggSLP',
					'0x36e2FCCCc59e5747Ff63a03ea2e5C0c2C14911e7': 'xSushiWethSLP',
					'0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd': 'tbtc/sbtcCrv',
					'0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3': 'crvRenWSBTC',
					'0x798D1bE841a82a273720CE31c822C61a67a601C3': 'DIGG',
					'0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'WBTC',
					'0x3472A5A71965499acd81997a54BBA8D852C6E53d': 'BADGER',
					'0x49849C98ae39Fff122806C06791Fa73784FB3675': 'crvRenWBTC',
					'0x110492b31c59716AC47337E616804E3E3AdC0b4a': 'wbtcBadgerSLP',
					'0xcD7989894bc033581532D2cd88Da5db0A4b12859': 'wbtcBadgerUNI-V2',
					'0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58': 'wbtcWethSLP',
					'0xE86204c4eDDd2f70eE00EAd6805f917671F56c52': 'wbtcDiggUNI-V2',
					'0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272': 'xSUSHI',

					'0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': 'bcrvRenWBTC',
					'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': 'bBADGER',
					'0x235c9e24D3FB2FAFd58a2E49D454Fdcd2DBf7FF1': 'bUNI-V2',
					'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': 'bSLP',
					'0x1862A18181346EBd9EdAf800804f89190DeF24a5': 'bSLP',
					'0x88128580ACdD9c04Ce47AFcE196875747bF2A9f6': 'bSLP',
					'0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87': 'bSupercrvRenWBTC',
					'0xb9D076fDe463dbc9f915E5392F807315Bf940334': 'btbtc/sbtcCrv',
					'0xd04c48A53c111300aD41190D63681ed3dAd998eC': 'bcrvRenWSBTC',
				},
				names: {
					'0x6B3595068778DD592e39A122f4f5a5cF09C90fE2': 'SUSHI',
					'0x9a13867048e01c663ce8Ce2fE0cDAE69Ff9F35E3': 'wBTC/DIGG Sushi LP',
					'0xE86204c4eDDd2f70eE00EAd6805f917671F56c52': 'wBTC/DIGG Uni LP',
					'0x36e2FCCCc59e5747Ff63a03ea2e5C0c2C14911e7': 'xSUSHI/wETH Sushi LP',
					'0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd': 'Curve.fi tBTC/sBTCCrv LP',
					'0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3': 'Curve.fi crvRenWSBTC',
					'0x798D1bE841a82a273720CE31c822C61a67a601C3': 'Digg',
					'0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'Wrapped Bitcoin',
					'0x3472A5A71965499acd81997a54BBA8D852C6E53d': 'Badger',
					'0x49849C98ae39Fff122806C06791Fa73784FB3675': 'Curve.fi crvRenWBTC',
					'0x110492b31c59716AC47337E616804E3E3AdC0b4a': 'wBTC/Badger Sushi LP',
					'0xcD7989894bc033581532D2cd88Da5db0A4b12859': 'wBTC/Badger Uni LP',
					'0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58': 'wBTC/wETH Sushi LP',
					'0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272': 'xSUSHI',

					'0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': 'bcrvRenWBTC',
					'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': 'bBADGER',
					'0x235c9e24D3FB2FAFd58a2E49D454Fdcd2DBf7FF1': 'bUNI-V2',
					'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': 'bSLP',
					'0x1862A18181346EBd9EdAf800804f89190DeF24a5': 'bSLP',
					'0x88128580ACdD9c04Ce47AFcE196875747bF2A9f6': 'bSLP',
					'0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87': 'bSupercrvRenWBTC',
					'0xb9D076fDe463dbc9f915E5392F807315Bf940334': 'btbtc/sbtcCrv',
					'0xd04c48A53c111300aD41190D63681ed3dAd998eC': 'bcrvRenWSBTC',
				},
				tokenMap: tokenMap,
			};
		default:
			return undefined;
	}
};
