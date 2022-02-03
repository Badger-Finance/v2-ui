import {
	ChainCommon,
	LockAndMintParams,
	LockAndMintTransaction,
	LockChain,
	MintChain,
	RenNetwork,
} from '@renproject/interfaces';
import RenJS from '@renproject/ren';
import { Ox } from '@renproject/utils';
import BigNumber from 'bignumber.js';
import { RenVMGateway, TransactionSummary } from './searchResult';
import { queryGateway } from './searchTactics/searchGateway';
import { RenVMProvider } from '@renproject/rpc/build/main/v2';
import { NETWORK } from './environmentVariables';
import { getMintChainParams } from './chains/chains';

export const searchGateway = async (
	gateway: RenVMGateway,
	getChain: (chainName: string) => ChainCommon | null,
): Promise<RenVMGateway | null> => {
	const provider = new RenVMProvider(NETWORK);

	if (!gateway.queryGateway) {
		gateway.queryGateway = await queryGateway(provider, gateway.address, getChain);
	}

	return gateway;
};

export const getGatewayInstance = async (
	searchDetails: LockAndMintTransaction,
	_network: RenNetwork,
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
		to: await getMintChainParams(summary.toChain as MintChain, inputs.to, inputs.payload, summary.asset),
		nonce: Ox(inputs.nonce),
	};

	const provider = new RenVMProvider(NETWORK);
	const lockAndMint = await new RenJS(provider as any).lockAndMint(params as any, {
		transactionVersion: searchDetails.version,
		gPubKey: (searchDetails.in as any).gpubkey,
		loadCompletedDeposits: true,
	});

	return lockAndMint;
};
