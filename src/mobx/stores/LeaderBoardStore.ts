import { action, extendObservable } from 'mobx';
import { LeaderboardRank as CoreLeaderboardRank, LeaderBoardEntry } from 'mobx/model';
import { RootStore } from 'mobx/store';
import { fetchCompleteLeaderBoardData } from 'mobx/utils/apiV2';
import { isWithinRange } from '../utils/helpers';
import { LEADERBOARD_RANKS } from '../../config/constants';

interface LeaderboardRank extends CoreLeaderboardRank {
	usersAmount: number;
	firstSlotPosition: number;
	lastSlotPosition: number;
}

export class LeaderBoardStore {
	private store: RootStore;

	public completeBoard?: LeaderBoardEntry[];
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
			const fetchedLeaderBoard = await fetchCompleteLeaderBoardData();

			if (fetchedLeaderBoard) {
				this.completeBoard = fetchedLeaderBoard;
				this.ranks = this.retrieveRanksInformation(fetchedLeaderBoard);
			}
		},
	);

	private retrieveRanksInformation = (leaderBoard: LeaderBoardEntry[]): LeaderboardRank[] => {
		const ranks: LeaderboardRank[] = LEADERBOARD_RANKS.map((rank) => ({
			...rank,
			usersAmount: 0,
			firstSlotPosition: 0,
			lastSlotPosition: 0,
		}));

		// check in which rank each leaderboard entry belongs
		for (const leaderBoardEntry of leaderBoard) {
			for (const rankEntry of ranks) {
				if (isWithinRange(Number(leaderBoardEntry.boost), rankEntry.boostRangeStart, rankEntry.boostRangeEnd)) {
					rankEntry.usersAmount++;
					break;
				}
			}
		}

		// calculate the range of each rank in the leaderboard entries
		// e.g: the frenzy badgers consist of the badgers from the 1th slot to the 124th slot
		for (let i = 0; i < ranks.length; i++) {
			let usersInRank = ranks[i].usersAmount;

			for (let j = 0; j < i; j++) {
				usersInRank += ranks[j].usersAmount;
			}

			// +1 to replace zero index based position
			ranks[i].firstSlotPosition = ranks[i - 1]?.lastSlotPosition || 1; // start where last rank ended
			ranks[i].lastSlotPosition = usersInRank + 1;
		}

		return ranks;
	};
}
