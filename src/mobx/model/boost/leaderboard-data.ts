import { LeaderBoardBadger } from './leader-board-badger';

export interface LeaderBoardData {
	data: LeaderBoardBadger[];
	page: number;
	size: number;
	count: number;
	maxPage: number;
}
