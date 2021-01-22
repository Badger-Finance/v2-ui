import BadgerVault from './abis/Sett.json';
import BadgerSushiVault from './abis/SushiSett.json';
import DiggVault from './abis/DiggSett.json';
import BadgerGeyser from './abis/BadgerGeyser.json';
import SushiGeyser from './abis/SushiGeyser.json';
import BadgerTree from './abis/BadgerTree.json';
import deploy from '../deployments/mainnet.json';

export const vaultBatches = [
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
			deploy.sett_system.vaults['native.uniDiggWbtc'],
		],
		fillers: {
			symbol: ['badger', 'renCrv', 'sbtcCrv', 'tbtcCrv', 'uniBadgerWbtc', 'renCrv', 'uniDiggWbtc'],
			isFeatured: [false, false, false, false, true, true, true],
			position: [2, 11, 10, 9, 7, 8, 6],
			isSuperSett: [false, false, false, false, false, true, false, false, false],
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}'],
			},
			{
				name: 'getPricePerFullShare',
			},
			{
				name: 'balance',
			},
			{
				name: 'symbol',
			},
			{
				name: 'decimals',
			},
			{
				name: 'token',
			},
			{
				name: 'totalSupply',
			},
		],
	},
	{
		abi: BadgerSushiVault.abi,
		underlying: 'token',
		contracts: [
			deploy.sett_system.vaults['native.sushiWbtcEth'],
			deploy.sett_system.vaults['native.sushiBadgerWbtc'],
			deploy.sett_system.vaults['native.sushiDiggWbtc'],
		],
		fillers: {
			isFeatured: [false, true],
			position: [5, 4, 3],
			symbolPrefix: ['sushi', 'sushi', 'sushi'],
			onsenId: ['103', '21', '73'],
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}'],
			},
			{
				name: 'getPricePerFullShare',
			},
			{
				name: 'balance',
			},
			{
				name: 'symbol',
			},
			{
				name: 'decimals',
			},
			{
				name: 'token',
			},
			{
				name: 'totalSupply',
			},
		],
		growthEndpoints: [
			'https://api.thegraph.com/subgraphs/name/sushiswap/master-chef',
			'https://apy.sushiswap.fi/xsushi',
			'https://apy.sushiswap.fi/?pairs=',
		],
	},
	{
		abi: DiggVault.abi,
		underlying: 'token',
		contracts: [deploy.sett_system.vaults['native.digg']],
		fillers: {
			isFeatured: [true],
			position: [1],
			symbolPrefix: [''],
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}'],
			},
			{
				name: 'getPricePerFullShare',
			},
			{
				name: 'balance',
			},
			{
				name: 'symbol',
			},
			{
				name: 'decimals',
			},
			{
				name: 'totalSupply',
			},
			{
				name: 'token',
			},
		],
	},
];

export const geyserBatches = [
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
				args: [deploy.token],
			},
			{
				name: 'totalStaked',
			},
			{
				name: 'balance',
			},
			{
				name: 'getStakingToken',
			},
		],
		contracts: [
			deploy.geysers['native.badger'],
			deploy.geysers['native.renCrv'],
			deploy.geysers['native.sbtcCrv'],
			deploy.geysers['native.tbtcCrv'],
			deploy.geysers['native.uniBadgerWbtc'],
			deploy.geysers['harvest.renCrv'],
			deploy.geysers['native.uniDiggWbtc'],
		],
		fillers: {
			isFeatured: [false, false, false, false, true, true, true],
			isSuperSett: [false, false, false, false, false, true, false, false],
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
				args: [deploy.token],
			},
			{
				name: 'totalStaked',
			},
			{
				name: 'balance',
			},
			{
				name: 'getStakingToken',
			},
		],
		contracts: [
			deploy.geysers['native.sushiDiggWbtc'].toLowerCase(),
			deploy.geysers['native.sushiWbtcEth'].toLowerCase(),
			deploy.geysers['native.sushiBadgerWbtc'].toLowerCase(),
		],
		fillers: {
			getStakingToken: [
				deploy.sett_system.vaults['native.sushiDiggWbtc'],
				deploy.sett_system.vaults['native.sushiWbtcEth'],
				deploy.sett_system.vaults['native.sushiBadgerWbtc'],
			],
			onsenId: ['103', '21', '73'],
		},
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
		deploy.token.toLowerCase(), // $DIGG
	],
};
