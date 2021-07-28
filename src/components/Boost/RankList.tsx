import React from 'react';
import { ButtonBase, Grid, Tooltip } from '@material-ui/core';
import { RankConnector } from './RankConnector';
import { RankLevel } from './RankLevel';
import { makeStyles } from '@material-ui/core/styles';
import { RankProgressBar } from './RankProgressBar';
import { BOOST_RANKS } from '../../config/system/boost-ranks';

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
	accountStakeRatio?: number;
	onRankClick: (boost: number) => void;
}

export const RankList = ({
	currentMultiplier = BOOST_RANKS[0].levels[0].multiplier, // default to first multiplier
	accountStakeRatio = BOOST_RANKS[0].levels[0].multiplier,
	onRankClick,
}: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			{BOOST_RANKS.slice()
				.reverse()
				.map((rank, index) => {
					const rankStartBoundary = rank.levels[0].stakeRatioBoundary;
					const rankEndBoundary = rank.levels[rank.levels.length - 1].stakeRatioBoundary;

					const isObtained = accountStakeRatio >= rankEndBoundary;
					const isLocked = accountStakeRatio < rankStartBoundary;
					const isCurrentBoost = rank.levels.some((_rank) => _rank.multiplier === currentMultiplier);

					const progressItems = rank.levels.map((level, index) => (
						<div className={classes.progressEntry} key={`${level.stakeRatioBoundary}_${level.multiplier}`}>
							<RankProgressBar
								boost={currentMultiplier}
								accountBoost={accountStakeRatio}
								rangeStart={rankStartBoundary}
								rangeEnd={rankEndBoundary}
							/>
							<RankConnector signatureColor={rank.signatureColor} isMain={index === 0} />
						</div>
					));

					const rankItem = (
						<Grid container alignItems="flex-end" key={`${index}_${rankStartBoundary}_${rank.name}`}>
							<Grid item className={classes.progressContainer}>
								{progressItems}
							</Grid>
							<Grid item xs>
								<ButtonBase
									className={classes.buttonBase}
									onClick={() => onRankClick(rank.levels[0].multiplier)}
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
								key={`${index}_${rank.name}_${rankStartBoundary}`}
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
