const deploy = require("./deploy-final.json")
const BadgerVault = require("./abis/Sett.json")
const BadgerSushiVault = require("./abis/SushiSett.json")

const BadgerGeyser = require("./abis/BadgerGeyser.json")
const SushiGeyser = require("./abis/SushiGeyser.json")
const BadgerTree = require("./abis/BadgerTree.json")


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
			isFeatured: [
				false,
				false,
				false,
				false,
				true,
				true
			],
			listOrder: [
				7,
				4,
				5,
				3,
				2,
				6
			],
			isSuperSett: [
				false,
				false,
				false,
				false,
				false,
				true
			]
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}']
			}],
	},
	{
		abi: BadgerSushiVault.abi,
		underlying: 'token',
		contracts: [
			deploy.sett_system.vaults['sushi.sushiWbtcWeth'].toLowerCase(),
			deploy.sett_system.vaults['sushi.sushiBadgerWBtc'].toLowerCase()
		],
		fillers: {
			isFeatured: [
				false,
				true
			],
			listOrder: [
				0,
				1
			],
			symbolPrefix: [
				'sushi',
				'sushi'
			]
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}']
			}],
	}]

export const geysers = [
	{
		abi: BadgerGeyser.abi,
		underlying: 'getStakingToken',

		methods: [
			{
				name: 'totalStakedFor',
				args: ['{connectedAddress}']
			},
			{
				name: 'getUnlockSchedulesFor',
				args: [deploy.token]
			}],
		contracts: [
			deploy.geysers['native.badger'],
			deploy.geysers['native.renCrv'],
			deploy.geysers['native.sbtcCrv'],
			deploy.geysers['native.tbtcCrv'],
			deploy.geysers['native.uniBadgerWbtc'],
			deploy.geysers['harvest.renCrv'],
		]
	},
	{
		abi: SushiGeyser.abi,
		underlying: 'getStakingToken',

		methods: [
			{
				name: 'totalStakedFor',
				args: ['{connectedAddress}']
			},
			{
				name: 'getUnlockSchedulesFor',
				args: [deploy.token]
			}],
		contracts: [
			deploy.geysers['sushi.sushiWbtcWeth'].toLowerCase(),
			deploy.geysers['sushi.sushiBadgerWBtc'].toLowerCase()
		],
		fillers: {
			getStakingToken: [
				deploy.sett_system.vaults['sushi.sushiWbtcWeth'],
				deploy.sett_system.vaults['sushi.sushiBadgerWBtc']
			],
			onsenId: [
				'21',
				'73'
			]
		},

		growthEndpoint: "https://api.thegraph.com/subgraphs/name/sushiswap/master-chef",

	}

]

export const rewards = {
	endpoint: 'https://fzqm8i0owc.execute-api.us-east-1.amazonaws.com/prod',
	network: 1,
	contract: "0x660802Fc641b154aBA66a62137e71f331B6d787A",
	abi: BadgerTree.abi,
	tokens: [
		deploy.token.toLowerCase(),
		deploy.sett_system.vaults['native.uniBadgerWbtc'].toLowerCase(),
		"0x6b3595068778dd592e39a122f4f5a5cf09c90fe2".toLowerCase() // $SUSHI
	],
}
