import BigNumber from 'bignumber.js';
import { HoneyPotStore, NFT } from 'mobx/stores/honeyPotStore';

export function reduceNextGlobalRedemptionRate(store: HoneyPotStore): BigNumber {
	if (!store.nfts) return new BigNumber('0');

	return store.nfts.reduce(
		(redemptionSum: BigNumber, nft: NFT) => redemptionSum.plus(store.calculateRedemptionRate(nft)),
		new BigNumber('0'),
	);
}
