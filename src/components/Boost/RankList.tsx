import React from 'react';
import { ButtonBase, Grid, Tooltip } from '@material-ui/core';
import { RankConnector } from './RankConnector';
import { RankLevel } from './RankLevel';
import { LEADERBOARD_RANKS } from '../../config/constants';

interface Props {
	currentBoost?: string;
	accountBoost?: number;
	onRankJump: (boost: number) => void;
}

export const RankList = ({ currentBoost, accountBoost, onRankJump }: Props): JSX.Element => {
	return (
		<>
			{LEADERBOARD_RANKS.map((rank) => {
				const isObtained = accountBoost ? accountBoost > 1 && accountBoost >= rank.boostRangeStart : false;
				const isLocked = Number(currentBoost) < rank.boostRangeStart;
				const isCurrentBoost = Number(currentBoost) === rank.boostRangeStart;

				const rankItem = (
					<Grid container alignItems="flex-end">
						<Grid item>
							<RankConnector
								boost={Number(currentBoost)}
								accountBoost={accountBoost || 1}
								rankBoost={rank.boostRangeStart}
							/>
						</Grid>
						<Grid item>
							<ButtonBase disabled={isCurrentBoost} onClick={() => onRankJump(rank.boostRangeStart)}>
								<RankLevel
									key={`${rank.boostRangeStart}_${rank.name}`}
									name={rank.name}
									boost={rank.boostRangeStart}
									obtained={isObtained}
									locked={isLocked}
								/>
							</ButtonBase>
						</Grid>
					</Grid>
				);

				if (!isCurrentBoost) {
					return (
						<Tooltip
							title="Jump to rank"
							arrow
							placement="left"
							color="primary"
							key={`${rank.boostRangeStart}_${rank.name}`}
						>
							{rankItem}
						</Tooltip>
					);
				}

				return rankItem;
			})}
		</>
	);
};
