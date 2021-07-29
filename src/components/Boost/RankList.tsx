import React from 'react';
import { ButtonBase, Grid, Tooltip } from '@material-ui/core';
import { RankConnector } from './RankConnector';
import { RankLevel } from './RankLevel';
import { makeStyles } from '@material-ui/core/styles';
import { RankProgressBar } from './RankProgressBar';
import { BOOST_LEVELS, BOOST_RANKS, MIN_BOOST_LEVEL } from '../../config/system/boost-ranks';

const useStyles = makeStyles({
	buttonBase: {
		width: '100%',
	},
	placeholderBar: {
		position: 'relative',
		alignSelf: 'stretch',
		width: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	progressContainer: {
		display: 'flex',
		flexDirection: 'column-reverse',
		alignSelf: 'stretch',
	},
	progressEntry: {
		display: 'flex',
		flex: '1 1 0%',
		alignItems: 'flex-end',
	},
});

interface Props {
	currentMultiplier?: number;
	accountMultiplier?: number;
	onRankClick: (boost: number) => void;
}

export const RankList = ({
	currentMultiplier = MIN_BOOST_LEVEL.multiplier, // default to first multiplier
	accountMultiplier = MIN_BOOST_LEVEL.multiplier,
	onRankClick,
}: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			{BOOST_RANKS.slice()
				.reverse()
				.map((rank, ranksIndex) => {
					const rankStartBoundary = rank.levels[0].multiplier;

					const isObtained = accountMultiplier > rankStartBoundary;
					const isLocked = accountMultiplier < rankStartBoundary;
					const isCurrentBoost = rank.levels.some((_rank) => _rank.multiplier === currentMultiplier);

					const progressItems = rank.levels.map((level, levelsIndex) => {
						const currentBoostLevelIndex = BOOST_LEVELS.findIndex(
							(_level) => _level.multiplier === level.multiplier,
						);
						const nextLevel = BOOST_LEVELS[currentBoostLevelIndex + 1];
						const levelRangeStart = level.multiplier;
						const levelRangeEnd = nextLevel ? nextLevel.multiplier : level.multiplier;

						return (
							<div
								className={classes.progressEntry}
								key={`${level.stakeRatioBoundary}_${level.multiplier}`}
							>
								<RankProgressBar
									multiplier={currentMultiplier}
									accountMultiplier={accountMultiplier}
									rangeStart={levelRangeStart}
									rangeEnd={levelRangeEnd}
								/>
								<RankConnector signatureColor={rank.signatureColor} isMain={levelsIndex === 0} />
							</div>
						);
					});

					const rankItem = (
						<Grid container alignItems="flex-end" key={`${ranksIndex}_${rankStartBoundary}_${rank.name}`}>
							<Grid item className={classes.progressContainer}>
								{progressItems}
							</Grid>
							<Grid item xs>
								<ButtonBase
									className={classes.buttonBase}
									onClick={() => {
										console.log(`jumping to multiplier => ${rank.levels[0].multiplier}`);
										onRankClick(rank.levels[0].multiplier);
									}}
									aria-label={`${rank.name} Rank`}
								>
									<RankLevel
										name={rank.name}
										signatureColor={rank.signatureColor}
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
								key={`${ranksIndex}_${rank.name}_${rankStartBoundary}`}
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
