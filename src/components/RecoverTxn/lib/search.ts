import { ChainCommon } from '@renproject/interfaces';

import { DEBUG } from './environmentVariables';
import { SearchResult } from './searchResult';
import { searchTactics } from './searchTactics';
import { TaggedError } from './taggedError';

export enum SearchErrors {
	NO_RESULTS = 'No results found.',
}

/**
 * `search` accepts a transaction, address or RenVM hash and returns one of
 * 1) A RenVM Gateway
 * 2) A RenVM Transaction
 *
 * @param searchString
 */
export const search = async (
	searchString: string,
	updateStatus: (status: string) => void,
	getChain: (chainName: string) => ChainCommon | null,
): Promise<SearchResult | SearchResult[]> => {
	for (const tactic of searchTactics) {
		try {
			if (tactic.match(searchString, getChain)) {
				const result = await tactic.search(searchString, updateStatus, getChain);
				if (result && (!Array.isArray(result) || result.length > 0)) {
					return result;
				}
			}
		} catch (error) {
			if (DEBUG) {
				console.error('DEBUG', error);
			}
		}
	}

	throw new TaggedError(SearchErrors.NO_RESULTS);
};
