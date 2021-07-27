import React from 'react';
import { ButtonBase, Grid, Tooltip } from '@material-ui/core';
import { RankConnector } from './RankConnector';
import { RankLevel } from './RankLevel';
import { LEADERBOARD_RANKS } from '../../config/constants';
import { styled } from '@material-ui/core/styles';
import { RankProgressBar } from './RankProgressBar';
import { BOOST_RANKS } from '../../config/system/boost-ranks';

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
	currentMultiplier?: number;
	accountStakeRatio?: number;
	onRankClick: (boost: number) => void;
}

export const RankList = ({
	currentMultiplier = BOOST_RANKS[0].levels[0].multiplier, // default to first multiplier
	accountStakeRatio = BOOST_RANKS[0].levels[0].multiplier,
	onRankClick,
}: Props): JSX.Element => {
	return (
		<>
			{LEADERBOARD_RANKS.map((rank, index) => {
				const isObtained = accountStakeRatio > 1 && accountStakeRatio >= rank.boostRangeStart;
				const isLocked = currentMultiplier < rank.boostRangeStart;
				const isCurrentBoost = currentMultiplier === rank.boostRangeStart;

				const rankItem = (
					<Grid container alignItems="flex-end" key={`${index}_${rank.boostRangeStart}_${rank.name}`}>
						{accountStakeRatio !== undefined ? (
							<RankProgressBar
								boost={currentMultiplier}
								accountBoost={accountStakeRatio}
								rangeStart={rank.boostRangeStart}
								rangeEnd={rank.boostRangeEnd}
							/>
						) : (
							<PlaceholderBar />
						)}
						<Grid item>
							<RankConnector
								boost={currentMultiplier}
								accountBoost={accountStakeRatio}
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
