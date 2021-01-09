
const deploy = require("./deploy-final.json")
const BadgerHunt = require("./abis/BadgerHunt.json")
const UFragments = require("./abis/UFragments.json")
const UFragmentsPolicy = require("./abis/UFragmentsPolicy.json")
const MedianOracle = require("./abis/MedianOracle.json")
const Orchestrator = require("./abis/Orchestrator.json")

export const rewards = {
	endpoint: 'https://fzqm8i0owc.execute-api.us-east-1.amazonaws.com/prod/hunt',
	contract: deploy['badgerHunt'],
	abi: BadgerHunt.abi,
	tokens: [
		deploy.sett_system.vaults['native.badger'],
	],
}
export const token = {
	contract: "0xd46ba6d942050d489dbd938a2c909a5d5039a161",
	abi: UFragments.abi
}

export const digg = [
	{
		addresses: ["0xd46ba6d942050d489dbd938a2c909a5d5039a161"],
		abi: UFragments.abi,
		allReadMethods: true,
		groupByNamespace: true,
		logging: false,
		namespace: "token",
	},
	{
		addresses: ["0x1b228a749077b8e307c5856ce62ef35d96dca2ea"],
		abi: UFragmentsPolicy.abi,
		allReadMethods: true,
		groupByNamespace: true,
		logging: false,
		namespace: "policy",
	},
	{
		addresses: ['0x99c9775e076fdf99388c029550155032ba2d8914'],
		abi: MedianOracle.abi,
		groupByNamespace: true,
		namespace: "oracle",
		readMethods: [
			{
				name: 'providerReports',
				args: ['0xfc4b1Ce32ed7310028DCC0d94C7B3D96dCd880e0',0]
			}
		]
	}
]


export const orchestrator = {
	contract: '0x6fb00a180781e75f87e2b690af0196baa77c7e7c',
	abi: Orchestrator.abi
}
