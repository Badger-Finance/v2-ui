import React from 'react';
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { BadgerBoostLevel } from './BadgerBoostLevel';

const useStyles = makeStyles((theme) => ({
	root: {
		margin: 'auto',
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		flexDirection: 'column',
		height: 453,
	},
	header: {
		height: 50,
	},
	rank: {
		marginRight: theme.spacing(1),
	},
	divider: {
		[theme.breakpoints.down('sm')]: {
			margin: theme.spacing(2, 0),
		},
		margin: theme.spacing(3, 0, 2, 0),
	},
	currentLevelImgContainer: {
		width: 20,
		height: 20,
		margin: 'auto 4px auto 0',
	},
	fullWidthImage: {
		width: '100%',
		height: '100%',
	},
	currentLevelText: {
		fontSize: 12,
	},
	viewLeaderBoardContainer: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginTop: theme.spacing(2),
	},
	viewLeaderBoardButton: {
		padding: 4,
		height: 34,
	},
	badgerLevelsContainer: {
		borderLeft: '5px solid',
		borderImageSlice: 1,
		borderImageSource:
			'linear-gradient(to top, #F2A52B 0%, #F2A52B 40%, #74D189 40%, #74D189 53%, rgba(255, 255, 255, 0.1) 53%, rgba(255, 255, 255, 0.1) 100%)',
	},
}));

const BADGER_LEVELS = [
	{
		name: 'Basic Badger',
		img: 'assets/icons/basic-badger.svg',
		boost: 1.0,
	},
	{
		name: 'Neo Badger',
		img: 'assets/icons/neo-badger.svg',
		boost: 1.25,
	},
	{
		name: 'Hero Badger',
		img: 'assets/icons/hero-badger.svg',
		boost: 1.5,
	},
	{
		name: 'Hyper Badger',
		img: 'assets/icons/hyper-badger.svg',
		boost: 2.0,
	},
	{
		name: 'Frenzy Badger',
		img: 'assets/icons/frenzy-badger.svg',
		boost: 2.5,
	},
];

const getBadgerLevelFromBoost = (currentBoost: number): typeof BADGER_LEVELS[0] => {
	// if boost is smaller than first level early return it
	if (currentBoost < BADGER_LEVELS[0].boost) {
		return BADGER_LEVELS[0];
	}

	for (let index = 0; index < BADGER_LEVELS.length; index++) {
		const currentBadgerLevel = BADGER_LEVELS[index];
		const nextBadgerLevel = BADGER_LEVELS[index + 1];

		// boost has reached last level
		if (!nextBadgerLevel) {
			return currentBadgerLevel;
		}

		// make sure the boost is within this range (inclusive on left limit but exclusive or right one)
		if (currentBoost >= currentBadgerLevel.boost && currentBoost < nextBadgerLevel.boost) {
			return currentBadgerLevel;
		}
	}

	// first level as default
	return BADGER_LEVELS[0];
};

interface Props {
	rank?: string;
	boost?: string;
}

export const BoostLeaderBoardRank = ({ rank, boost = '1' }: Props): JSX.Element => {
	const classes = useStyles();

	const currentBadgerLevel = getBadgerLevelFromBoost(Number(boost));

	return (
		<Grid container component={Paper} className={classes.root}>
			<Grid container className={classes.header}>
				<Grid item xs={12}>
					<Typography variant="body2" color="textSecondary">
						Leaderboard Rank:
					</Typography>
				</Grid>
				<Grid item container alignContent="center" xs={12}>
					<Typography display="inline" className={classes.rank}>
						{rank ? `#${rank}` : <Skeleton width={35} />}
					</Typography>
					<div className={classes.currentLevelImgContainer}>
						<img
							className={classes.fullWidthImage}
							src={currentBadgerLevel.img}
							alt="current boost level icon"
						/>
					</div>
					<Typography display="inline">{currentBadgerLevel.name}</Typography>
				</Grid>
			</Grid>
			<Divider className={classes.divider} />
			<Grid item container className={classes.badgerLevelsContainer}>
				{/*reverse mutates array*/}
				{BADGER_LEVELS.slice()
					.reverse()
					.map((level) => (
						<BadgerBoostLevel
							key={`${level.boost}_${level.name}`}
							name={level.name}
							img={level.img}
							boost={level.boost}
						/>
					))}
			</Grid>
			<Grid item className={classes.viewLeaderBoardContainer} xs>
				<Button fullWidth color="primary" variant="outlined" size="small">
					View Leaderboard
				</Button>
			</Grid>
		</Grid>
	);
};
