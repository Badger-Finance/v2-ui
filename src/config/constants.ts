const BadgerVault = require("./abis/Sett.json")
const BadgerGeyser = require("./abis/BadgerGeyser.json")
const EnokiVault = require("./abis/SporePool.json")
const ItchiroVault = require("./abis/LockedGeyser.json")

export const collections = [
	{
		title: "Badger",
		id: 'badger',

		contracts: {
			vaults: ["0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28",
				"0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545",
				"0xd04c48A53c111300aD41190D63681ed3dAd998eC",
				"0xb9D076fDe463dbc9f915E5392F807315Bf940334",
				"0x235c9e24D3FB2FAFd58a2E49D454Fdcd2DBf7FF1",
				"0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87"],
			geysers: ["0xa9429271a28F8543eFFfa136994c0839E7d7bF77",
				"0x2296f174374508278DC12b806A7f27c87D53Ca15",
				"0x10fC82867013fCe1bD624FafC719Bb92Df3172FC",
				"0x085A9340ff7692Ab6703F17aB5FfC917B580a6FD",
				"0xA207D69Ea6Fb967E54baA8639c408c31767Ba62D",
				"0xeD0B7f5d9F6286d00763b0FFCbA886D8f9d56d5e"]
		},
		configs: {
			vaults: {
				abi: BadgerVault.abi,
				table: ['balance', 'name', 'symbol', 'balanceOf'],
				actions: ['deposit', 'depositAll', 'withdraw', 'withdrawAll'],
				underlying: 'getStakingToken',
				yielding: 'getStakingToken',
				walletMethods: ['balanceOf']
			},
			geysers: {
				abi: BadgerGeyser.abi,
				table: ['totalStaked', 'address', 'totalStakedFor'],
				actions: ['stake', 'unstake'],
				underlying: 'getStakingToken',
				yielding: 'getStakingToken',
				walletMethods: ['totalStakedFor']

			},
		}
	},
	{
		title: "Itchiro",
		id: 'itchiro',

		contracts: {
			geysers: ["0xe3033fcef753ff6d1c9b89fb3f69004f9e0be85f"]
		},
		configs: {
			geysers: {
				abi: ItchiroVault.abi,
				table: ['address', 'totalStaked', 'totalLockedShares', 'totalStakedFor', 'getNumStakes', 'getUnstakable'],
				actions: ['stake', 'unstake'],
				underlying: 'token',
				yielding: 'getDistributionToken',
				walletMethods: ['totalStakedFor']
			},
		}
	},


	// },
	// {
	// 	title: "Badger Geysers",
	// 	id: 'badger.geysers',
	// 	vaults: ["0xa9429271a28F8543eFFfa136994c0839E7d7bF77",
	// 		"0x2296f174374508278DC12b806A7f27c87D53Ca15",
	// 		"0x10fC82867013fCe1bD624FafC719Bb92Df3172FC",
	// 		"0x085A9340ff7692Ab6703F17aB5FfC917B580a6FD",
	// 		"0xA207D69Ea6Fb967E54baA8639c408c31767Ba62D",
	// 		"0xeD0B7f5d9F6286d00763b0FFCbA886D8f9d56d5e"],
	// 	abi: BadgerGeyser.abi,
	// 	config: {
	// 		table: ['totalStaked', 'address', 'totalStakedFor'],
	// 		actions: ['stake', 'unstake'],
	// 		underlying: 'getStakingToken',
	// 		yielding: 'getStakingToken',

	// 	},
	// 	walletMethods: ['totalStakedFor']
	// },
	// {
	// 	title: "Enoki",
	// 	id: 'enoki.finance',
	// 	vaults: ["0x91a73ca83Ada33800C8bFA982f3998Df5a7afA90",
	// 		"0x0C9a62478cAF29157543d89AdADf32bAC5cd4ba9",
	// 		"0x3350438bd37BA0Ff3700b406A8d9B40c62684794",
	// 		"0xAC49Bd103CA6C1812a2a71bfF43B3fffe553B6D8",
	// 		"0xEA46c37eBD7630B6DDCb10EaC597C37d5F887C53",
	// 	],
	// 	abi: EnokiVault.abi,
	// 	config: {
	// 		table: ['address', 'totalSupply', 'balanceOf', 'earned'],
	// 		actions: ['harvest', 'stake', 'withdraw'],
	// 		underlying: 'stakingToken',
	// 		yielding: 'sporeToken',
	// 	},
	// 	walletMethods: ['balanceOf', 'earned']

	// },
	// {
	// 	title: "Itchiro",
	// 	id: 'app.itchiro.com',
	// 	vaults: ["0xe3033fcef753ff6d1c9b89fb3f69004f9e0be85f",
	// 	],
	// 	abi: ItchiroVault.abi,
	// 	config: {
	// 		table: ['address', 'totalStaked', 'totalLockedShares', 'totalStakedFor', 'getNumStakes', 'getUnstakable'],
	// 		actions: ['stake', 'unstake'],
	// 		underlying: 'token',
	// 		yielding: 'getDistributionToken',
	// 	},
	// 	walletMethods: ['totalStakedFor', 'getNumStakes', 'getUnstakable']
	// },
]

export const fetchJson = {
	// method: 'GET',
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	}
}
