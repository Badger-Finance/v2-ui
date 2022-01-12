import { ChainCommon, LockAndMintTransaction } from '@renproject/interfaces';
import { RenVMProvider, ResponseQueryTx, unmarshalMintTx } from '@renproject/rpc/build/main/v2';
import { doesntError } from '@renproject/utils';

import { NETWORK } from '../environmentVariables';
import { allChains } from '../chains/chains';
import { RenVMGateway, RenVMTransactionError, TransactionSummary, TransactionType } from '../searchResult';
import { errorMatches, TaggedError } from '../taggedError';
import { summarizeTransaction } from './searchRenVMHash';
import { SearchTactic } from './searchTactic';

export const queryGateway = async (
	provider: RenVMProvider,
	gatewayAddress: string,
	getChain: (chainName: string) => ChainCommon | null,
): Promise<{
	result: LockAndMintTransaction;
	transactionType: TransactionType.Mint;
	summary: TransactionSummary;
}> => {
	let response: ResponseQueryTx;
	try {
		response = await provider.sendMessage('ren_queryGateway' as any, { gateway: gatewayAddress }, 1);
	} catch (error) {
		if (errorMatches(error, 'not found')) {
			throw new TaggedError(error, RenVMTransactionError.TransactionNotFound);
		}
		throw error;
	}

	// Unmarshal transaction.
	const unmarshalled = unmarshalMintTx(response);
	return {
		result: unmarshalled,
		transactionType: TransactionType.Mint as const,
		summary: await summarizeTransaction(unmarshalled, getChain),
	};
};

const OR = (left: boolean, right: boolean) => left || right;

export const searchGateway: SearchTactic<RenVMGateway> = {
	match: (searchString: string, getChain: (chainName: string) => ChainCommon | null) =>
		allChains
			.map((chain) => getChain(chain.chain))
			.map((chain) => doesntError(() => (chain ? chain.utils.addressIsValid(searchString) : false))())
			.reduce(OR, false),

	search: async (
		searchString: string,
		updateStatus: (status: string) => void,
		getChain: (chainName: string) => ChainCommon | null,
	): Promise<RenVMGateway> => {
		updateStatus('Looking up Gateway...');

		const provider = new RenVMProvider(NETWORK);

		let queryTx = await queryGateway(provider, searchString, getChain);

		return RenVMGateway(searchString, queryTx);
	},
};
