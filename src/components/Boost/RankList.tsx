import React from 'react';
import { ButtonBase, Grid, Tooltip } from '@material-ui/core';
import { RankConnector } from './RankConnector';
import { RankLevel } from './RankLevel';
import { LEADERBOARD_RANKS } from '../../config/constants';
import { styled } from '@material-ui/core/styles';
import { RankProgressBar } from './RankProgressBar';

const StyledButtonBase = styled(ButtonBase)({
	width: '100%',
});

const PlaceholderBar = styled('div')({
	position: 'relative',
	alignSelf: 'stretch',
	width: 4,
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
});

interface Props {
	currentBoost?: number;
	accountBoost?: number;
	onRankClick: (boost: number) => void;
}

export const RankList = ({ currentBoost = 0, accountBoost = 1, onRankClick }: Props): JSX.Element => {
	return (
		<>
			{LEADERBOARD_RANKS.map((rank, index) => {
				const isObtained = accountBoost > 1 && accountBoost >= rank.boostRangeStart;
				const isLocked = currentBoost < rank.boostRangeStart;
				const isCurrentBoost = currentBoost === rank.boostRangeStart;

				const rankItem = (
					<Grid container alignItems="flex-end" key={`${index}_${rank.boostRangeStart}_${rank.name}`}>
						{accountBoost !== undefined ? (
							<RankProgressBar
								boost={currentBoost}
								accountBoost={accountBoost}
								rangeStart={rank.boostRangeStart}
								rangeEnd={rank.boostRangeEnd}
							/>
						) : (
							<PlaceholderBar />
						)}
						<Grid item>
							<RankConnector
								boost={currentBoost}
								accountBoost={accountBoost}
								rankBoost={rank.boostRangeStart}
							/>
						</Grid>
						<Grid item xs>
							<StyledButtonBase
								onClick={() => onRankClick(rank.boostRangeStart)}
								aria-label={`${rank.name} Rank`}
							>
								<RankLevel
									name={rank.name}
									boost={rank.boostRangeStart}
									signatureColor={rank.signatureColor}
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
