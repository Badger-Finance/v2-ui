import { useCallback, useMemo, useState } from 'react';
import { OrderedMap } from 'immutable';

import { ChainCommon } from '@renproject/interfaces';

import { NETWORK } from '../lib/environmentVariables';
import { allChains, ChainMapper } from '../lib/chains/chains';
import { search, SearchErrors } from '../lib/search';
import { Searching, SearchResult } from '../lib/searchResult';
import { TaggedError } from '../lib/taggedError';

function useTxnSearch() {
	const [searchTxnLoading, setSearchTxnLoading] = useState<boolean>(false);
	const [searchTxn, setSearchTxn] = useState<SearchResult | null>(null);

	const chains = useMemo(() => {
		return allChains.reduce((acc: any, chainDetails: any) => {
			try {
				const chain = ChainMapper(chainDetails.chain, NETWORK);
				chain?.initialize(NETWORK);
				return acc.set(chainDetails.chain, chain || null);
			} catch (error) {
				console.error(error);
				return acc.set(chainDetails.chain, null);
			}
		}, OrderedMap<string, ChainCommon | null>());
	}, []);

	const getChainDetails = useCallback((chainName: string) => {
		for (const chain of allChains) {
			if (chain.chainPattern.exec(chainName)) {
				return chain;
			}
		}
		return null;
	}, []);

	const getChain = useCallback(
		(chainName: string) => {
			const chainDetails = getChainDetails(chainName);
			return chainDetails ? chains.get(chainDetails.chain, null) : null;
		},
		[chains, getChainDetails],
	);

	const handleSearchByTxnId = useCallback(
		(txnId) => {
			setSearchTxn(null);
			setSearchTxnLoading(true);
			setSearchTxn(Searching(txnId));

			search(txnId, console.log, getChain)
				.then((result: any) => {
					if (result && Array.isArray(result)) {
						if (result.length === 0) {
							setSearchTxn(Searching(txnId, { noResult: true }));
							return;
						} else if (result.length === 1) {
							result = result[0];
						} else {
							setSearchTxn(Searching(txnId, { multipleResults: result }));
							return;
						}
					}

					setSearchTxn(result);
				})
				.catch((error: any) => {
					if ((error as TaggedError)._tag === SearchErrors.NO_RESULTS) {
						setSearchTxn(Searching(txnId, { noResult: true }));
					} else {
						setSearchTxn(Searching(txnId, { errorSearching: error }));
					}
				})
				.finally(() => setSearchTxnLoading(false));
		},
		[getChain],
	);

	return {
		searchTxn,
		handleSearchByTxnId,
		searchTxnLoading,
	};
}

export default useTxnSearch;
