
const deploy = require("./deploy-final.json")
const BadgerHunt = require("./abis/BadgerHunt.json")
const UFragments = require("./abis/UFragments.json")

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