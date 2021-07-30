import React from 'react';
import { ButtonBase, Grid } from '@material-ui/core';
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
	isOwned?: boolean;
	hasBeenReached?: boolean;
	onRankClick: (boost: number) => void;
}

export const RankItem = ({
	accountMultiplier,
	currentMultiplier,
	onRankClick,
	rank,
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
		</Grid>
	);
};
