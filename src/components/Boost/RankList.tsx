import React from 'react';
import { ButtonBase, Grid, Tooltip } from '@material-ui/core';
import { RankConnector } from './RankConnector';
import { RankLevel } from './RankLevel';
import { LEADERBOARD_RANKS } from '../../config/constants';
import { styled } from '@material-ui/core/styles';

const StyledButtonBase = styled(ButtonBase)({
	width: '100%',
});

interface Props {
	currentBoost?: string;
	accountBoost?: number;
	onRankClick: (boost: number) => void;
}

export const RankList = ({ currentBoost, accountBoost, onRankClick }: Props): JSX.Element => {
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
						<Grid item xs>
							<StyledButtonBase onClick={() => onRankClick(rank.boostRangeStart)}>
								<RankLevel
									key={`${rank.boostRangeStart}_${rank.name}`}
									name={rank.name}
									boost={rank.boostRangeStart}
									obtained={isObtained}
									locked={isLocked}
								/>
							</StyledButtonBase>
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
