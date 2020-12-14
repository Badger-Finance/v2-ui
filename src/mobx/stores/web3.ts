import BigNumber from "bignumber.js";
import Web3 from "web3";
import { Contract, ContractSendMethod } from "web3-eth-contract";
import { PromiEvent } from 'web3-core'

const { fetchJson } = require('../../config/constants')

export const estimateAndSend = (web3: Web3, method: ContractSendMethod, address: string, callback: (transaction: PromiEvent<Contract>) => void) => {
	fetch("http://localhost:8010/proxy", fetchJson)
		.then((result: any) => result.json())
		.then((price: any) => {
			let fastWei = new BigNumber(price.instant.toFixed(0))

			method.estimateGas({
				from: address,
				gas: fastWei.toNumber()
			}, (error: any, gasLimit: number) => {
				callback(method.send({ from: address, gas: gasLimit, gasPrice: fastWei.multipliedBy(1e9).toFixed(0) }))
			})
		})



	// .estimateGas({
	// 	from: account.address,
	// 	gasPrice: gasPrice
	// },(error, gasLimit) => 

	// merkleProof.proof)
	// 						.send({
	// 							from: account.address,
	// 							gas: Math.floor(gasLimit * 1.20),
	// 							gasPrice: gasPrice

	// 						})
	// 						.on('transactionHash', function (hash) {
	// 							console.log(hash)
	// 							emitter.emit("SNACK_BAR", { message: hash, type: "Hash" })

	// 						})
	// 						.on('receipt', function (receipt) {
	// 							// console.log(receipt);
	// 							dispatcher.dispatch({ type: HUNT_RETURNED, content: {} })
	// 							emitter.emit("SNACK_BAR", { message: "Rewards successfully claimed.", type: "Success" })
	// 							return
	// 						})



}
