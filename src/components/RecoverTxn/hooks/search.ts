import { useCallback, useMemo, useState } from 'react';
import { OrderedMap } from 'immutable';

import { ChainCommon } from '@renproject/interfaces';

import { NETWORK } from '../lib/environmentVariables';
import { allChains, ChainMapper } from '../lib/chains/chains';
import { search } from '../lib/search';
import { SearchResult } from '../lib/searchResult';

export type TxnSearch = {
	searchTxn: SearchResult | null;
	handleSearchByTxnId: (txId: string) => void;
	searchTxnLoading: boolean;
};

function useTxnSearch(): TxnSearch {
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
		(txnId: string) => {
			setSearchTxn(null);
			setSearchTxnLoading(true);

			search(txnId, console.log, getChain)
				.then((result: SearchResult | SearchResult[]) => {
					if (Array.isArray(result)) {
						result = result[0];
					}
					setSearchTxn(result);
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
