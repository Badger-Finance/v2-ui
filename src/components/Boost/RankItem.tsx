import React from 'react';
import { ButtonBase, Grid, Tooltip } from '@material-ui/core';
import { RankLevel } from './RankLevel';
import { makeStyles } from '@material-ui/core/styles';
import { RankProgressBarSlice } from './RankProgressBarSlice';
import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';

const useStyles = makeStyles({
	root: {
		display: 'flex',
		flexDirection: 'column-reverse',
		alignSelf: 'stretch',
	},
	buttonBase: {
		width: '100%',
	},
});

interface Props {
	currentMultiplier: number;
	accountMultiplier: number;
	rank: BoostRank;
	rankIndex: number;
	isOwned?: boolean;
	hasBeenReached?: boolean;
	onRankClick: (boost: number) => void;
}

export const RankItem = ({
	accountMultiplier,
	currentMultiplier,
	onRankClick,
	rank,
	rankIndex,
	hasBeenReached = false,
	isOwned = false,
}: Props): JSX.Element => {
	const classes = useStyles();

	const progressBar = rank.levels.map((level, levelsIndex, index) => (
		<RankProgressBarSlice
			key={`${level.stakeRatioBoundary}_${level.multiplier}_${index}`}
			accountMultiplier={accountMultiplier}
			currentMultiplier={currentMultiplier}
			currentBoostLevel={level}
			rank={rank}
			isMainSlice={levelsIndex === 0}
		/>
	));

	return (
		<Grid container alignItems="flex-end">
			<Grid item className={classes.root}>
				{progressBar}
			</Grid>
			<Tooltip
				enterTouchDelay={0}
				title="Jump to rank"
				arrow
				disableFocusListener={hasBeenReached}
				disableHoverListener={hasBeenReached}
				disableTouchListener={hasBeenReached}
				placement="left"
				color="primary"
				key={`${rank.name}_${rankIndex}`}
			>
				<Grid item xs>
					<ButtonBase
						className={classes.buttonBase}
						onClick={() => {
							onRankClick(rank.levels[0].multiplier);
						}}
						aria-label={`${rank.name} Rank`}
					>
						<RankLevel
							name={rank.name}
							signatureColor={rank.signatureColor}
							obtained={isOwned}
							hasBeenReached={hasBeenReached}
						/>
					</ButtonBase>
				</Grid>
			</Tooltip>
		</Grid>
	);
};
