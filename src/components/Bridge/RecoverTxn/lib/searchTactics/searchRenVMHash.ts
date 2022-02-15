import BigNumber from 'bignumber.js';

import { BurnAndReleaseTransaction, ChainCommon, LockAndMintTransaction } from '@renproject/interfaces';
import { RenVMProvider, ResponseQueryTx, unmarshalBurnTx, unmarshalMintTx } from '@renproject/rpc/build/main/v2';
import { toReadable } from '@renproject/utils';

import { NETWORK } from '../environmentVariables';
import {
	RenVMTransaction,
	RenVMTransactionError,
	SummarizedTransaction,
	TransactionSummary,
	TransactionType,
} from '../searchResult';
import { errorMatches, TaggedError } from '../taggedError';
import { unmarshalClaimFeesTx } from '../unmarshalClaimFees';
import { isURLBase64 } from './common';
import { SearchTactic } from './searchTactic';

const RenVMChain = 'RenVM';

export const parseV2Selector = (selector: string) => {
	const maybeMint = selector.split('/to');
	if (maybeMint.length === 2) {
		return {
			asset: maybeMint[0],
			from: maybeMint[0],
			to: maybeMint[1],
		};
	}

	const maybeBurn = selector.split('/from');
	if (maybeBurn.length === 2) {
		return {
			asset: maybeBurn[0],
			from: maybeBurn[1],
			to: maybeBurn[0],
		};
	}

	const maybeClaimFees = /(.*)\/claimFees/.exec(selector);
	if (maybeClaimFees) {
		const asset = maybeClaimFees[1];
		return {
			asset,
			from: RenVMChain,
			to: asset,
		};
	}

	throw new Error(`Unable to parse v2 selector ${selector}`);
};

export const summarizeTransaction = async (
	searchDetails: LockAndMintTransaction | BurnAndReleaseTransaction,
	getChain: (chainName: string) => ChainCommon | null,
): Promise<TransactionSummary> => {
	let { to, from, asset } = parseV2Selector(searchDetails.to);

	const fromChain = getChain(from);
	from = fromChain ? fromChain.name : from;
	const toChain = getChain(to);
	to = toChain ? toChain.name : to;

	let amountInRaw: BigNumber | undefined;
	let amountIn: BigNumber | undefined;
	let amountOutRaw: BigNumber | undefined;
	let amountOut: BigNumber | undefined;

	if ((searchDetails.in as any).amount && !(searchDetails.in as any).amount.isNaN()) {
		amountInRaw = new BigNumber((searchDetails.in as any).amount);
	}

	let chain;
	if (fromChain && fromChain.assetIsNative(asset)) {
		chain = fromChain;
	} else {
		chain = toChain;
	}

	try {
		if (amountInRaw && chain) {
			amountIn = toReadable(amountInRaw, await chain.assetDecimals(asset));
			if (
				searchDetails.out &&
				(searchDetails.out.revert === undefined || searchDetails.out.revert.length === 0) &&
				(searchDetails.out as any).amount
			) {
				amountOutRaw = new BigNumber((searchDetails.out as any).amount);
				amountOut = toReadable(amountOutRaw, await chain.assetDecimals(asset));
			}
		}
	} catch (error) {
		// Ignore error.
	}

	return {
		asset,
		to,
		toChain: toChain || undefined,

		from,
		fromChain: fromChain || undefined,

		amountIn,
		amountInRaw,

		amountOut,
		amountOutRaw,
	};
};

export const unmarshalTransaction = async (
	response: ResponseQueryTx,
	getChain: (chainName: string) => ChainCommon | null,
): Promise<SummarizedTransaction> => {
	const isMint = /((\/to)|(To))/.exec(response.tx.selector);
	const isClaim = /\/claimFees/.exec(response.tx.selector);

	// Unmarshal transaction.
	if (isClaim) {
		const unmarshalled = unmarshalClaimFeesTx(response);
		return {
			result: unmarshalled,
			transactionType: TransactionType.ClaimFees as const,
			summary: await summarizeTransaction(unmarshalled, getChain),
		};
	} else if (isMint) {
		const unmarshalled = unmarshalMintTx(response);
		return {
			result: unmarshalled,
			transactionType: TransactionType.Mint as const,
			summary: await summarizeTransaction(unmarshalled, getChain),
		};
	} else {
		const unmarshalled = unmarshalBurnTx(response);
		return {
			result: unmarshalled,
			transactionType: TransactionType.Burn as const,
			summary: await summarizeTransaction(unmarshalled, getChain),
		};
	}
};

export const queryMintOrBurn = async (
	provider: RenVMProvider,
	transactionHash: string,
	getChain: (chainName: string) => ChainCommon | null,
): Promise<SummarizedTransaction> => {
	let response: ResponseQueryTx;
	try {
		response = await provider.queryTx(transactionHash, 1);
	} catch (error) {
		if (errorMatches(error, 'not found')) {
			throw new TaggedError(error, RenVMTransactionError.TransactionNotFound);
		}
		throw error;
	}

	return unmarshalTransaction(response, getChain);
};

export const searchRenVMHash: SearchTactic<RenVMTransaction> = {
	match: (searchString: string) => isURLBase64(searchString, { length: 32 }),

	search: async (
		searchString: string,
		updateStatus: (status: string) => void,
		getChain: (chainName: string) => ChainCommon | null,
	): Promise<RenVMTransaction> => {
		updateStatus('Looking up RenVM hash...');

		const provider = new RenVMProvider(NETWORK);

		let queryTx = await queryMintOrBurn(provider, searchString, getChain);

		return RenVMTransaction(searchString, queryTx);
	},
};
