import { LeaderBoardEntry } from './leaderboard-entry';

export interface LeaderBoardData {
	data: LeaderBoardEntry[];
	page: number;
	size: number;
	count: number;
	maxPage: number;
}
