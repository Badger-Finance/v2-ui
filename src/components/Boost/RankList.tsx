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
			{LEADERBOARD_RANKS.map((rank, index) => {
				const isObtained = accountBoost ? accountBoost > 1 && accountBoost >= rank.boostRangeStart : false;
				const isLocked = Number(currentBoost) < rank.boostRangeStart;
				const isCurrentBoost = Number(currentBoost) === rank.boostRangeStart;

				const rankItem = (
					<Grid container alignItems="flex-end" key={`${index}_${rank.boostRangeStart}_${rank.name}`}>
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
							key={`${index}_${rank.name}_${rank.boostRangeStart}`}
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
