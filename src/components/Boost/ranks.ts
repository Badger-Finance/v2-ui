type BadgerRank = {
	name: string;
	boost: number;
};

export const BADGER_RANKS: BadgerRank[] = [
	{
		name: 'Basic Badger',
		boost: 1.0,
	},
	{
		name: 'Neo Badger',
		boost: 1.4,
	},
	{
		name: 'Hero Badger',
		boost: 1.8,
	},
	{
		name: 'Hyper Badger',
		boost: 2.2,
	},
	{
		name: 'Frenzy Badger',
		boost: 2.6,
	},
];

export const getRankFromBoost = (currentBoost: number): BadgerRank => {
	return BADGER_RANKS[getRankNumberFromBoost(currentBoost)];
};

export const getRankNumberFromBoost = (currentBoost: number): number => {
	if (currentBoost < BADGER_RANKS[0].boost) {
		return 0;
	}

	for (let index = 0; index < BADGER_RANKS.length; index++) {
		const currentBadgerLevel = BADGER_RANKS[index];
		const nextBadgerLevel = BADGER_RANKS[index + 1];

		// boost has reached last level
		if (!nextBadgerLevel) {
			return index;
		}

		// make sure the boost is within this range (inclusive on left limit but exclusive or right one)
		if (currentBoost >= currentBadgerLevel.boost && currentBoost < nextBadgerLevel.boost) {
			return index;
		}
	}

	// first level as default
	return 0;
};
