import deploy from './deploy-final.json';
import BadgerVault from './abis/Sett.json';
import BadgerSushiVault from './abis/SushiSett.json';

import BadgerGeyser from './abis/BadgerGeyser.json';
import SushiGeyser from './abis/SushiGeyser.json';
import BadgerTree from './abis/BadgerTree.json';

export const vaults = [
	{
		abi: BadgerVault.abi,
		underlying: 'token',
		contracts: [
			deploy.sett_system.vaults['native.badger'],
			deploy.sett_system.vaults['native.renCrv'],
			deploy.sett_system.vaults['native.sbtcCrv'],
			deploy.sett_system.vaults['native.tbtcCrv'],
			deploy.sett_system.vaults['native.uniBadgerWbtc'],
			deploy.sett_system.vaults['harvest.renCrv'],
		],
		fillers: {
			isFeatured: [false, false, false, false, true, true],
			listOrder: [7, 4, 5, 6, 2, 3],
			isSuperSett: [false, false, false, false, false, true],
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}']
			},
			{
				name: 'getPricePerFullShare'
			},
			{
				name: 'balance'
			},
			{
				name: 'symbol'
			},
			{
				name: 'token'
			},
			{
				name: 'totalSupply'
			}
		],
	},
	{
		abi: BadgerSushiVault.abi,
		underlying: 'token',
		contracts: [
			deploy.sett_system.vaults['sushi.sushiWbtcWeth'].toLowerCase(),
			deploy.sett_system.vaults['sushi.sushiBadgerWBtc'].toLowerCase(),
		],
		fillers: {
			isFeatured: [false, true],
			listOrder: [0, 1],
			symbolPrefix: ['sushi', 'sushi'],
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}']
			},
			{
				name: 'getPricePerFullShare'
			},
			{
				name: 'balance'
			},
			{
				name: 'symbol'
			},
			{
				name: 'totalSupply'
			},
			{
				name: 'token'
			}],
	}]

export const geysers = [
	{
		abi: BadgerGeyser.abi,
		underlying: 'getStakingToken',

		methods: [
			{
				name: 'totalStakedFor',
				args: ['{connectedAddress}'],
			},
			{
				name: 'getUnlockSchedulesFor',
				args: [deploy.token]
			},
			{
				name: 'totalStaked'
			},
			{
				name: 'balance'
			},
			{
				name: 'getStakingToken'
			}],
		contracts: [
			deploy.geysers['native.badger'],
			deploy.geysers['native.renCrv'],
			deploy.geysers['native.sbtcCrv'],
			deploy.geysers['native.tbtcCrv'],
			deploy.geysers['native.uniBadgerWbtc'],
			deploy.geysers['harvest.renCrv'],
		],
		fillers: {
			isFeatured: [false, false, false, false, true, true],
			listOrder: [7, 4, 5, 3, 2, 6],
			isSuperSett: [false, false, false, false, false, true],
		},
	},
	{
		abi: SushiGeyser.abi,
		underlying: 'getStakingToken',

		methods: [
			{
				name: 'totalStakedFor',
				args: ['{connectedAddress}'],
			},
			{
				name: 'getUnlockSchedulesFor',
				args: [deploy.token]
			},
			{
				name: 'totalStaked'
			},
			{
				name: 'balance'
			},
			{
				name: 'getStakingToken'
			}],
		contracts: [
			deploy.geysers['sushi.sushiWbtcWeth'].toLowerCase(),
			deploy.geysers['sushi.sushiBadgerWBtc'].toLowerCase(),
		],
		fillers: {
			getStakingToken: [
				deploy.sett_system.vaults['sushi.sushiWbtcWeth'],
				deploy.sett_system.vaults['sushi.sushiBadgerWBtc'],
			],
			onsenId: ['21', '73'],
			listOrder: [0, 1],
		},

		growthEndpoints: [
			'https://api.thegraph.com/subgraphs/name/sushiswap/master-chef',
			'https://apy.sushiswap.fi/xsushi',
			'https://apy.sushiswap.fi/?pairs=',
		],
	},
];

export const rewards = {
	endpoint: 'https://fzqm8i0owc.execute-api.us-east-1.amazonaws.com/prod',
	network: 1,
	contract: '0x660802Fc641b154aBA66a62137e71f331B6d787A',
	abi: BadgerTree.abi,
	tokens: [
		deploy.token.toLowerCase(),
		deploy.sett_system.vaults['native.uniBadgerWbtc'].toLowerCase(),
		'0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'.toLowerCase(), // $SUSHI
		'0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7'.toLowerCase(), // $xSUSHI
	],
};
