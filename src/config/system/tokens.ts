import { ERC20 } from "config/constants";
import _ from "lodash";
import deploy from './deploy-final.json';

export const curveTokens = {
	contracts: [
		'0x49849c98ae39fff122806c06791fa73784fb3675', //renBTC/wBTC (crvRenWBTC)
		'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd', //Curve.fi tBTC/sbtcCrv (tbtc/sbtc...)
		'0x075b1bb99792c9e1041ba13afef80c91a1e70fb3', //Curve.fi renBTC/wBTC/sBTC
	],
	priceEndpoints: [
		'https://www.curve.fi/raw-stats/ren2-1440m.json',
		'https://www.curve.fi/raw-stats/tbtc-1440m.json',
		'https://www.curve.fi/raw-stats/rens-1440m.json',
	],
	names: ['Curve.fi renBTC/wBTC', 'Curve.fi tBTC/sbtcCrv', 'Curve.fi renBTC/wBTC/sBTC'],
};

// export const priceEndpoints = [
// 	"http://localhost:8010/proxy",
// 	"http://localhost:8011/proxy"
// ]
export const priceEndpoints = [
	'https://api.thegraph.com/subgraphs/name/jiro-ono/sushiswap-v1-exchange',
	'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
];

export const tokenBatches = [
	{
		abi: ERC20.abi,
		methods: [
			{
				name: 'totalSupply',
			},
			{
				name: 'balanceOf',
				args: ['{connectedAddress}'],
			}
		],
		contracts: [
			'0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
			'0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545',
			'0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3',
			'0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28',
			'0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7',
			'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd',
			'0x075b1bb99792c9e1041ba13afef80c91a1e70fb3',
			'0x235c9e24d3fb2fafd58a2e49d454fdcd2dbf7ff1',
			'0x758a43ee2bff8230eeb784879cdcff4828f2544d',
			'0x798d1be841a82a273720ce31c822c61a67a601c3',
			'0x1862a18181346ebd9edaf800804f89190def24a5',
			'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
			'0x3472a5a71965499acd81997a54bba8d852c6e53d',
			'0x49849c98ae39fff122806c06791fa73784fb3675',
			'0x110492b31c59716ac47337e616804e3e3adc0b4a',
			'0xaf5a1decfa95baf63e0084a35c62592b774a2a87',
			'0xb9d076fde463dbc9f915e5392f807315bf940334',
			'0xcd7989894bc033581532d2cd88da5db0a4b12859',
			'0xceff51756c56ceffca006cd410b03ffc46dd3a58',
			'0xd04c48a53c111300ad41190d63681ed3dad998ec',
			'0xd46ba6d942050d489dbd938a2c909a5d5039a161',
			'0xe86204c4eddd2f70ee00ead6805f917671f56c52',
			'0x88128580acdd9c04ce47afce196875747bf2a9f6',
		],
	},
];

export const decimals: any = {
	'0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': 18,
	'0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545': 18,
	'0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3': 18,
	'0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28': 18,
	'0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7': 18,
	'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd': 18,
	'0x075b1bb99792c9e1041ba13afef80c91a1e70fb3': 18,
	'0x235c9e24d3fb2fafd58a2e49d454fdcd2dbf7ff1': 18,
	'0x758a43ee2bff8230eeb784879cdcff4828f2544d': 18,
	'0x798d1be841a82a273720ce31c822c61a67a601c3': 9,
	'0x1862a18181346ebd9edaf800804f89190def24a5': 18,
	'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 8,
	'0x3472a5a71965499acd81997a54bba8d852c6e53d': 18,
	'0x49849c98ae39fff122806c06791fa73784fb3675': 18,
	'0x110492b31c59716ac47337e616804e3e3adc0b4a': 18,
	'0xaf5a1decfa95baf63e0084a35c62592b774a2a87': 18,
	'0xb9d076fde463dbc9f915e5392f807315bf940334': 18,
	'0xcd7989894bc033581532d2cd88da5db0a4b12859': 18,
	'0xceff51756c56ceffca006cd410b03ffc46dd3a58': 18,
	'0xd04c48a53c111300ad41190d63681ed3dad998ec': 18,
	'0xd46ba6d942050d489dbd938a2c909a5d5039a161': 18,
	'0xe86204c4eddd2f70ee00ead6805f917671f56c52': 18,
	'0x88128580acdd9c04ce47afce196875747bf2a9f6': 18,
};
export const symbols: any = {
	'0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': "SUSHI",
	'0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3': "wbtcDiggSLP",
	'0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7': "xSushiWethSLP",
	'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd': "tbtc/sbtcCrv",
	'0x075b1bb99792c9e1041ba13afef80c91a1e70fb3': "crvRenWSBTC",
	'0x798d1be841a82a273720ce31c822c61a67a601c3': "DIGG",
	'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': "WBTC",
	'0x3472a5a71965499acd81997a54bba8d852c6e53d': "BADGER",
	'0x49849c98ae39fff122806c06791fa73784fb3675': "crvRenWBTC",
	'0x110492b31c59716ac47337e616804e3e3adc0b4a': "wbtcBadgerSLP",
	'0xcd7989894bc033581532d2cd88da5db0a4b12859': "wbtcBadgerUNI-V2",
	'0xceff51756c56ceffca006cd410b03ffc46dd3a58': "wbtcWethSLP",
	'0xd46ba6d942050d489dbd938a2c909a5d5039a161': "AMPL",
	'0xe86204c4eddd2f70ee00ead6805f917671f56c52': "wbtcDiggUNI-V2",

	'0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545': "bcrvRenWBTC",
	'0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28': "bBADGER",
	'0x235c9e24d3fb2fafd58a2e49d454fdcd2dbf7ff1': "bUNI-V2",
	'0x758a43ee2bff8230eeb784879cdcff4828f2544d': "bSLP",
	'0x1862a18181346ebd9edaf800804f89190def24a5': "bSLP",
	'0x88128580acdd9c04ce47afce196875747bf2a9f6': "bSLP",
	'0xaf5a1decfa95baf63e0084a35c62592b774a2a87': "bSupercrvRenWBTC",
	'0xb9d076fde463dbc9f915e5392f807315bf940334': "btbtc/sbtcCrv",
	'0xd04c48a53c111300ad41190d63681ed3dad998ec': "bcrvRenWSBTC",
};
export const names: any = {
	'0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': "SUSHI",
	'0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3': "wBTC/DIGG Sushi LP",
	'0xe86204c4eddd2f70ee00ead6805f917671f56c52': "wBTC/DIGG Uni LP",
	'0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7': "xSUSHI/wETH Sushi LP",
	'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd': "Curve.fi tBTC/sBTCCrv LP",
	'0x075b1bb99792c9e1041ba13afef80c91a1e70fb3': "Curve.fi crvRenWSBTC",
	'0x798d1be841a82a273720ce31c822c61a67a601c3': "Digg",
	'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': "Wrapped Bitcoin",
	'0x3472a5a71965499acd81997a54bba8d852c6e53d': "Badger",
	'0x49849c98ae39fff122806c06791fa73784fb3675': "Curve.fi crvRenWBTC",
	'0x110492b31c59716ac47337e616804e3e3adc0b4a': "wBTC/Badger Sushi LP",
	'0xcd7989894bc033581532d2cd88da5db0a4b12859': "wBTC/Badger Uni LP",
	'0xceff51756c56ceffca006cd410b03ffc46dd3a58': "wBTC/wETH Sushi LP",
	'0xd46ba6d942050d489dbd938a2c909a5d5039a161': "AMPL",

	'0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545': "bcrvRenWBTC",
	'0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28': "bBADGER",
	'0x235c9e24d3fb2fafd58a2e49d454fdcd2dbf7ff1': "bUNI-V2",
	'0x758a43ee2bff8230eeb784879cdcff4828f2544d': "bSLP",
	'0x1862a18181346ebd9edaf800804f89190def24a5': "bSLP",
	'0x88128580acdd9c04ce47afce196875747bf2a9f6': "bSLP",
	'0xaf5a1decfa95baf63e0084a35c62592b774a2a87': "bSupercrvRenWBTC",
	'0xb9d076fde463dbc9f915e5392f807315bf940334': "btbtc/sbtcCrv",
	'0xd04c48a53c111300ad41190d63681ed3dad998ec': "bcrvRenWSBTC",
};
export const vaults: any = {
	'0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': "SUSHI",
	'0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3': "wBTC/DIGG Sushi LP",
	'0xe86204c4eddd2f70ee00ead6805f917671f56c52': "wBTC/DIGG Uni LP",
	'0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7': "xSUSHI/wETH Sushi LP",
	'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd': "Curve.fi tBTC/sBTCCrv LP",
	'0x075b1bb99792c9e1041ba13afef80c91a1e70fb3': "Curve.fi crvRenWSBTC",
	'0x798d1be841a82a273720ce31c822c61a67a601c3': "Digg",
	'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': "Wrapped Bitcoin",
	'0x3472a5a71965499acd81997a54bba8d852c6e53d': "Badger",
	'0x49849c98ae39fff122806c06791fa73784fb3675': "Curve.fi crvRenWBTC",
	'0x110492b31c59716ac47337e616804e3e3adc0b4a': "wBTC/Badger Sushi LP",
	'0xcd7989894bc033581532d2cd88da5db0a4b12859': "wBTC/Badger Uni LP",
	'0xceff51756c56ceffca006cd410b03ffc46dd3a58': "wBTC/wETH Sushi LP",
	'0xd46ba6d942050d489dbd938a2c909a5d5039a161': "AMPL",

	'0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545': "bcrvRenWBTC",
	'0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28': "bBADGER",
	'0x235c9e24d3fb2fafd58a2e49d454fdcd2dbf7ff1': "bUNI-V2",
	'0x758a43ee2bff8230eeb784879cdcff4828f2544d': "bSLP",
	'0x1862a18181346ebd9edaf800804f89190def24a5': "bSLP",
	'0x88128580acdd9c04ce47afce196875747bf2a9f6': "bSLP",
	'0xaf5a1decfa95baf63e0084a35c62592b774a2a87': "bSupercrvRenWBTC",
	'0xb9d076fde463dbc9f915e5392f807315bf940334': "btbtc/sbtcCrv",
	'0xd04c48a53c111300ad41190d63681ed3dad998ec': "bcrvRenWSBTC",
};


const vaultMap: any = [
	deploy.sett_system.vaults['sushi.sushiDiggWbtc'].toLowerCase(),
	deploy.sett_system.vaults['native.sbtcCrv'].toLowerCase(),
	deploy.sett_system.vaults['native.renCrv'].toLowerCase(),
	deploy.sett_system.vaults['native.digg'].toLowerCase(),
	deploy.sett_system.vaults['native.badger'].toLowerCase(),
	deploy.sett_system.vaults['harvest.renCrv'].toLowerCase(),
	deploy.sett_system.vaults['native.renCrv'].toLowerCase(),
	deploy.sett_system.vaults['sushi.sushiBadgerWbtc'].toLowerCase(),
	deploy.sett_system.vaults['native.uniBadgerWbtc'].toLowerCase(),
	deploy.sett_system.vaults['sushi.sushiWbtcWeth'].toLowerCase(),
	deploy.sett_system.vaults['native.uniDiggWbtc'].toLowerCase(),
	deploy.sett_system.vaults['native.tbtcCrv'].toLowerCase(),
];
export const tokenMap: any = _.zipObject(vaultMap, [
	'0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3',
	'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd',
	'0x075b1bb99792c9e1041ba13afef80c91a1e70fb3',
	'0x798d1be841a82a273720ce31c822c61a67a601c3',
	'0x3472a5a71965499acd81997a54bba8d852c6e53d',
	'0x49849c98ae39fff122806c06791fa73784fb3675',
	'0x49849c98ae39fff122806c06791fa73784fb3675',
	'0x110492b31c59716ac47337e616804e3e3adc0b4a',
	'0xcd7989894bc033581532d2cd88da5db0a4b12859',
	'0xceff51756c56ceffca006cd410b03ffc46dd3a58',
	'0xe86204c4eddd2f70ee00ead6805f917671f56c52',
	'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd']);


// export const tokenData = {
// 	'0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x075b1bb99792c9e1041ba13afef80c91a1e70fb3': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x235c9e24d3fb2fafd58a2e49d454fdcd2dbf7ff1': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x758a43ee2bff8230eeb784879cdcff4828f2544d': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x798d1be841a82a273720ce31c822c61a67a601c3': {
// 		decimals: 9,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x1862a18181346ebd9edaf800804f89190def24a5': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
// 		decimals: 8,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x3472a5a71965499acd81997a54bba8d852c6e53d': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x49849c98ae39fff122806c06791fa73784fb3675': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0x110492b31c59716ac47337e616804e3e3adc0b4a': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0xaf5a1decfa95baf63e0084a35c62592b774a2a87': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0xb9d076fde463dbc9f915e5392f807315bf940334': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0xcd7989894bc033581532d2cd88da5db0a4b12859': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0xceff51756c56ceffca006cd410b03ffc46dd3a58': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0xd04c48a53c111300ad41190d63681ed3dad998ec': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0xd46ba6d942050d489dbd938a2c909a5d5039a161': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	},
// 	'0xe86204c4eddd2f70ee00ead6805f917671f56c52': {
// 		decimals: 18,
// 		symbol: '',
// 		logo: ''
// 	}
// };
