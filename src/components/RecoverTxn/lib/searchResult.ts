import { LockAndMintTransaction, BurnAndReleaseTransaction, ChainCommon } from '@renproject/interfaces';
import { LockAndMint, LockAndMintDeposit } from '@renproject/ren';
import BigNumber from 'bignumber.js';
import { v4 as uuid } from 'uuid';

export enum SearchResultType {
	Searching,

	/**
	 * Redirect represents a generic search result that points to a new url. This
	 * URL can be a relative URL or it can point to an external website. Its ID is
	 * the URL.
	 */
	Redirect,
	/**
	 * RenVMTransaction represents a mint or burn. Its ID is a RenVM hash.
	 */
	RenVMTransaction,

	/**
	 * RenVMTransaction represents a mint or burn. Its ID is a RenVM hash.
	 */
	LegacyRenVMTransaction,

	/**
	 * RenVMGateway represents a gateway address. Its ID is the address.
	 */
	RenVMGateway,
}

export interface SearchResultCommon {
	uuid: string;

	type: SearchResultType;
	resultPath: string;
}

// Searching ////////////////////////////////////////////////////////////////////

export interface Searching extends SearchResultCommon {
	type: SearchResultType.Searching;
	resultPath: string;
	searchString: string;

	noResult?: boolean;
	errorSearching?: Error;
	multipleResults?: SearchResult[];
}

/* eslint-disable @typescript-eslint/no-redeclare */
export const Searching = (searchString: string, details?: Partial<Searching>): Searching => ({
	uuid: uuid(),
	type: SearchResultType.Searching,
	searchString,
	resultPath: `/search/${encodeURIComponent(searchString)}`,
	...details,
});

// RenVMTransaction ////////////////////////////////////////////////////////////

export enum RenVMTransactionError {
	TransactionNotFound = 'transaction-not-found',
}

export interface TransactionSummary {
	asset: string;

	from: string;
	fromChain?: ChainCommon;

	to: string;
	toChain?: ChainCommon;

	amountIn?: BigNumber;
	amountInRaw?: BigNumber;

	amountOut?: BigNumber;
	amountOutRaw?: BigNumber;
}

export enum TransactionType {
	Mint = 'mint',
	Burn = 'burn',
	ClaimFees = 'claimFees',
}

export type SummarizedTransaction =
	| {
			result: LockAndMintTransaction;
			summary: TransactionSummary;
			transactionType: TransactionType.Mint;
	  }
	| {
			result: BurnAndReleaseTransaction;
			summary: TransactionSummary;
			transactionType: TransactionType.Burn;
	  }
	| {
			result: any;
			summary: TransactionSummary;
			transactionType: TransactionType.ClaimFees;
	  };

export interface RenVMTransaction extends SearchResultCommon {
	type: SearchResultType.RenVMTransaction;
	resultPath: string;
	txHash: string;
	queryTx?: SummarizedTransaction | Error;
	deposit?: LockAndMintDeposit;
}

export const RenVMTransaction = (
	transactionHash: string,
	queryTx?: SummarizedTransaction | Error,
	deposit?: LockAndMintDeposit,
): RenVMTransaction => {
	return {
		uuid: uuid(),
		type: SearchResultType.RenVMTransaction,
		resultPath: `/tx/${encodeURIComponent(transactionHash)}`,
		txHash: transactionHash,
		queryTx,
		deposit,
	};
};

// LegacyRenVMTransaction //////////////////////////////////////////////////////

export interface LegacyRenVMTransaction extends SearchResultCommon {
	type: SearchResultType.LegacyRenVMTransaction;
	resultPath: string;
	txHash: string;
	queryTx?: SummarizedTransaction | Error;
	deposit?: LockAndMintDeposit;
}

export const LegacyRenVMTransaction = (
	transactionHash: string,
	queryTx?: SummarizedTransaction | Error,
	deposit?: LockAndMintDeposit,
): LegacyRenVMTransaction => {
	return {
		uuid: uuid(),
		type: SearchResultType.LegacyRenVMTransaction,
		resultPath: `/legacy-tx/${encodeURIComponent(transactionHash)}`,
		txHash: transactionHash,
		queryTx,
		deposit,
	};
};

// RenVMGateway ////////////////////////////////////////////////////////////

export interface RenVMGateway extends SearchResultCommon {
	type: SearchResultType.RenVMGateway;
	resultPath: string;
	address: string;
	queryGateway?: {
		result: LockAndMintTransaction;
		transactionType: TransactionType.Mint;
		summary: TransactionSummary;
	};
	lockAndMint?: LockAndMint;
}

export const RenVMGateway = (
	address: string,
	queryGateway?: {
		result: LockAndMintTransaction;
		transactionType: TransactionType.Mint;
		summary: TransactionSummary;
	},
	lockAndMint?: LockAndMint,
): RenVMGateway => {
	return {
		uuid: uuid(),
		type: SearchResultType.RenVMGateway,
		resultPath: `/gateway/${encodeURIComponent(address)}`,
		address,
		queryGateway,
		lockAndMint,
	};
};

////////////////////////////////////////////////////////////////////////////////

export type SearchResult = Searching | RenVMTransaction | LegacyRenVMTransaction | RenVMGateway;
