import { ethers } from 'ethers';

import {
	ChainCommon,
	EthArgs,
	LockAndMintParams,
	LockAndMintTransaction,
	LockChain,
	MintChain,
	RenNetwork,
} from '@renproject/interfaces';
import RenJS from '@renproject/ren';
import { RenVMProvider } from '@renproject/rpc/build/main/v1';
import { Ox } from '@renproject/utils';

import { NETWORK } from './environmentVariables';
import { getEvmABI } from './chains/getABI';
import { LegacyRenVMTransaction, TransactionSummary } from './searchResult';
import { queryMintOrBurn } from './searchTactics/searchLegacyRenVMTransaction';

export const searchLegacyTransaction = async (
	transaction: LegacyRenVMTransaction,
	getChain: (chainName: string) => ChainCommon | null,
): Promise<LegacyRenVMTransaction | null> => {
	const provider = new RenVMProvider(NETWORK);

	if (!transaction.queryTx) {
		transaction.queryTx = await queryMintOrBurn(provider, transaction.txHash, getChain);
	}

	return transaction;
};

export const getLegacyTransactionDepositInstance = async (
	searchDetails: LockAndMintTransaction,
	network: RenNetwork,
	summary: TransactionSummary,
) => {
	// const abi = (searchDetails.in.p.abi[0].inputs || []).slice(0, -3);

	// const abiCoder = new AbiCoder();
	// const abiValues = abiCoder.decodeParameters(
	//   abi.map((x) => x.type),
	//   "0x" + searchDetails.in.p.value.toString("hex")
	// );

	// const parameters: EthArgs = abi.map((abiItem, i) => ({
	//   name: abiItem.name,
	//   type: abiItem.type,
	//   value: abiValues[i],
	// }));

	const inputs = searchDetails.in;

	if (summary.fromChain && summary.toChain) {
		let functionName: string;
		let parameters: EthArgs;

		if (searchDetails.in.p.abi[0] && searchDetails.in.p.abi[0].inputs) {
			const abi = (searchDetails.in.p.abi[0].inputs || []).slice(0, -3);

			const abiValues = ethers.utils.defaultAbiCoder.decode(
				abi.map((x) => x.type),
				'0x' + searchDetails.in.p.value.toString('hex'),
			);

			parameters = abi.map((abiItem, i) => ({
				name: abiItem.name,
				type: abiItem.type,
				value: abiValues[i],
			}));

			functionName = searchDetails.in.p.fn;
		} else {
			const abiFull = await getEvmABI(summary.toChain, inputs.to);
			if (!Array.isArray(abiFull)) {
				throw new Error(abiFull);
			}

			const abis = abiFull.filter(
				(abi) =>
					abi.inputs &&
					abi.inputs.length >= 3 &&
					(abi.inputs[abi.inputs?.length - 3].type === 'uint256' ||
						abi.inputs[abi.inputs?.length - 3].type === 'uint') &&
					abi.inputs[abi.inputs?.length - 2].type === 'bytes32' &&
					abi.inputs[abi.inputs?.length - 1].type === 'bytes',
			);

			let abi = abis[0];
			if (abis.length > 1 && abis.filter((abi) => abi.name === 'mintThenSwap').length) {
				abi = abis.filter((abi) => abi.name === 'mintThenSwap')[0];
			}

			const abiValues = ethers.utils.defaultAbiCoder.decode(
				(abi.inputs?.slice(0, -3) || []).map((x) => x.type),
				Ox(inputs.p.value),
			);

			parameters = (abi.inputs?.slice(0, -3) || []).map((abiItem, i) => ({
				name: abiItem.name,
				type: abiItem.type,
				value: abiValues[i],
			}));

			functionName = abi.name || '';
		}

		if (summary.fromChain && summary.toChain) {
			const params: LockAndMintParams = {
				asset: summary.asset,
				from: summary.fromChain as LockChain,
				to: summary.toChain as MintChain,

				contractCalls: [
					{
						sendTo: searchDetails.in.to,
						contractFn: functionName,
						contractParams: parameters,
					},
				],
				nonce: searchDetails.in.n,
			};

			const lockAndMint = await new RenJS(network as any).lockAndMint(params as any, {
				loadCompletedDeposits: true,
			});

			const tx = await summary.fromChain.transactionFromRPCFormat(
				Buffer.from(searchDetails.in.utxo.txHash, 'hex'),
				searchDetails.in.utxo.vOut.toString(),
				false,
			);

			const deposit = await lockAndMint.processDeposit({
				transaction: tx,
				amount: searchDetails.in.utxo.amount,
			});

			const depositHash = deposit.txHash();
			if (depositHash !== searchDetails.hash) {
				console.error(`Expected ${depositHash} to equal ${searchDetails.hash}.`);
				await deposit.signed();
			}

			return {
				lockAndMint,
				deposit,
			};
		}
	}

	return { lockAndMint: null, deposit: null };
};
