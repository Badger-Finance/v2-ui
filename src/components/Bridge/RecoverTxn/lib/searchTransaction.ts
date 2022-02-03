import BigNumber from 'bignumber.js';

import {
	ChainCommon,
	LockAndMintParams,
	LockAndMintTransaction,
	LockChain,
	MintChain,
	RenNetwork,
} from '@renproject/interfaces';
import RenJS from '@renproject/ren';
import { LockAndMintDeposit } from '@renproject/ren/build/main/lockAndMint';
import { RenVMProvider } from '@renproject/rpc/build/main/v2';
import { Ox } from '@renproject/utils';

import { NETWORK } from './environmentVariables';
import { getMintChainParams } from './chains/chains';
import { RenVMTransaction, TransactionSummary } from './searchResult';
import { queryMintOrBurn } from './searchTactics/searchRenVMHash';

export const searchTransaction = async (
	transaction: RenVMTransaction,
	getChain: (chainName: string) => ChainCommon | null,
): Promise<RenVMTransaction | null> => {
	const provider = new RenVMProvider(NETWORK);

	if (!transaction.queryTx) {
		transaction.queryTx = await queryMintOrBurn(provider, transaction.txHash, getChain);
	}

	return transaction;
};

export const getTransactionDepositInstance = async (
	searchDetails: LockAndMintTransaction,
	network: RenNetwork,
	summary: TransactionSummary,
) => {
	const inputs = searchDetails.in as unknown as {
		amount: BigNumber;
		ghash: string;
		gpubkey: string;
		nhash: string;
		nonce: string;
		payload: string;
		phash: string;
		to: string;
		txid: string;
		txindex: string;
	};

	if (!summary.fromChain) {
		throw new Error(`Fetching transaction details not supported yet for ${summary.from}.`);
	}

	if (!summary.toChain) {
		throw new Error(`Fetching transaction details not supported yet for ${summary.to}.`);
	}

	const params: LockAndMintParams = {
		asset: summary.asset,
		from: summary.fromChain as LockChain,
		to: await getMintChainParams(
			summary.toChain as MintChain,
			inputs.to,
			Buffer.isBuffer(inputs.payload) ? inputs.payload.toString('hex') : inputs.payload,
			summary.asset,
		),
		nonce: Ox(inputs.nonce),
	};

	const provider = new RenVMProvider(NETWORK);
	const lockAndMint = await new RenJS(provider as any).lockAndMint(params as any, {
		transactionVersion: searchDetails.version,
		gPubKey: (searchDetails.in as any).gpubkey,
		loadCompletedDeposits: true,
	});

	let transaction;
	try {
		transaction = await summary.fromChain.transactionFromRPCFormat(inputs.txid, inputs.txindex.toString(), true);
	} catch (error) {
		console.error(error);
		throw error;
	}

	const deposit = await lockAndMint.processDeposit({
		transaction,
		amount: inputs.amount.toFixed(),
	});
	(deposit as any).gatewayAddress = lockAndMint.gatewayAddress;

	// await deposit.signed();

	const depositHash = deposit.txHash();
	if (depositHash !== searchDetails.hash) {
		console.error(`Expected ${depositHash} to equal ${searchDetails.hash}.`);
		await deposit.signed();
	}

	return {
		lockAndMint,
		deposit,
	};
};

export const continueMint = async (deposit: LockAndMintDeposit) => {
	return await deposit.mint();
};
