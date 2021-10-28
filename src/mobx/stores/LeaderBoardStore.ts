import { action, extendObservable } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import { LeaderBoardBadger } from '../model/boost/leader-board-badger';
import { LeaderboardRank } from '../model/boost/leaderboard-rank';
import { BOOST_RANKS } from '../../config/system/boost-ranks';

export class LeaderBoardStore {
	private store: RootStore;

	public completeBoard?: LeaderBoardBadger[];
	public ranks?: LeaderboardRank[];

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			completeBoard: this.completeBoard,
			ranks: this.ranks,
		});

		this.loadData();
	}

	loadData = action(
		async (): Promise<void> => {
			const fetchedLeaderBoard = await this.store.api.loadLeaderboard();

			if (fetchedLeaderBoard) {
				this.completeBoard = fetchedLeaderBoard;
				this.ranks = this.retrieveRanksInformation(fetchedLeaderBoard);
			}
		},
	);

	retrieveRanksInformation = (leaderBoard: LeaderBoardBadger[]): LeaderboardRank[] => {
		const ranks: LeaderboardRank[] = BOOST_RANKS.map((rank) => ({
			...rank,
			usersAmount: 0,
			rangeStart: rank.levels[0].multiplier,
			rangeEnd: rank.levels[rank.levels.length - 1].multiplier,
			badgersInRank: [],
		}));

		for (const leaderboardBadger of leaderBoard) {
			for (const rank of ranks) {
				const isBadgerInLevel = rank.levels.some(({ multiplier }) => multiplier === leaderboardBadger.boost);

				if (isBadgerInLevel) {
					rank.badgersInRank.push(leaderboardBadger);
				}
			}
		}

		return ranks;
	};
}
