import BadgerGeyser from './abis/BadgerGeyser.json';
import SushiGeyser from './abis/SushiGeyser.json';
import BadgerTree from './abis/BadgerTree.json';
import deploy from '../deployments/mainnet.json';

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
				name: 'getUnlockSchedulesFor',
				args: [deploy.digg_system.uFragments],
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
