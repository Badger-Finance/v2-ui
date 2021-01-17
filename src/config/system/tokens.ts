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
	symbols: ['renBTC/wBTC', 'tBTC/sbtcCrv', 'renBTC/wBTC/sBTC'],
};

// export const priceEndpoints = [
// 	"http://localhost:8010/proxy",
// 	"http://localhost:8011/proxy"
// ]
export const priceEndpoints = [
	'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
	'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
];
