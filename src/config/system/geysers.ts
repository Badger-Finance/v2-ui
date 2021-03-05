import BadgerGeyser from './abis/BadgerGeyser.json';
import SushiGeyser from './abis/SushiGeyser.json';
import BadgerTree from './abis/BadgerTree.json';
import deploy from '../deployments/mainnet.json';
import { XSUSHI_ADDRESS, FARM_ADDRESS, USDC_ADDRESS } from '../constants';

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
	// Staging endpoint
	// endpoint: 'https://laiv44udi0.execute-api.us-west-1.amazonaws.com/staging/v2/reward/tree',
	// Prod endpoint
	endpoint: 'https://2k2ccquid1.execute-api.us-west-1.amazonaws.com/prod/v2/reward/tree',
	network: 1,
	contract: '0x660802Fc641b154aBA66a62137e71f331B6d787A',
	abi: BadgerTree.abi,
	tokens: [
		deploy.token.toLowerCase(), // $BADGER
		// deploy.sett_system.vaults['native.uniBadgerWbtc'].toLowerCase(),
		// '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'.toLowerCase(), // $SUSHI
		deploy.digg_system.uFragments.toLowerCase(), // $DIGG
		deploy.sett_system.vaults['native.badger'].toLowerCase(), // $bBadger
		deploy.sett_system.vaults['native.digg'].toLowerCase(), // $bDigg
		XSUSHI_ADDRESS.toLowerCase(), // $xSUSHI
		FARM_ADDRESS.toLowerCase(), // $FARM
		USDC_ADDRESS.toLowerCase(), // $USDC
	],
};
