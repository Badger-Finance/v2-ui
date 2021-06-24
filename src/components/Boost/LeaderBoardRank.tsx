import React from 'react';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';

import { RankLevel } from './RankLevel';
import { getColorFromComparison } from './utils';
import { StoreContext } from '../../mobx/store-context';
import { BadgerBoostImage } from './BadgerBoostImage';
import { RankProgressBar } from './RankProgressBar';
import { RankConnector } from './RankConnector';

type BadgerRank = {
	name: string;
	color: string;
	boost: number;
};

const BADGER_RANKS: BadgerRank[] = [
	{
		name: 'Basic Badger',
		color: '#F2A52B',
		boost: 1.0,
	},
	{
		name: 'Neo Badger',
		color: '#75D089',
		boost: 1.4,
	},
	{
		name: 'Hero Badger',
		color: '#40C7FE',
		boost: 1.8,
	},
	{
		name: 'Hyper Badger',
		color: '#F22CDF',
		boost: 2.2,
	},
	{
		name: 'Frenzy Badger',
		color: '#F22C31',
		boost: 2.6,
	},
];

const getBadgerLevelFromBoost = (currentBoost: number): BadgerRank => {
	if (currentBoost < BADGER_RANKS[0].boost) {
		return BADGER_RANKS[0];
	}

	for (let index = 0; index < BADGER_RANKS.length; index++) {
		const currentBadgerLevel = BADGER_RANKS[index];
		const nextBadgerLevel = BADGER_RANKS[index + 1];

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
	return BADGER_RANKS[0];
};

const useRankStyles = (currentRank?: string, rank?: BigNumber.Value) => {
	return makeStyles((theme) => {
		if (!currentRank || !rank) {
			return {
				fontColor: {
					color: theme.palette.text.primary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentRank,
					toBeComparedValue: rank,
					greaterCaseColor: theme.palette.error.main,
					lessCaseColor: '#74D189',
					defaultColor: theme.palette.text.primary,
				}),
			},
		};
	});
};

const useStyles = makeStyles((theme) => ({
	root: {
		margin: 'auto',
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		flexDirection: 'column',
		height: 465,
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
}));

interface Props {
	rank?: string;
	boost?: string;
}

export const LeaderBoardRank = observer(
	({ rank, boost = '1' }: Props): JSX.Element => {
		const {
			user: { accountDetails },
		} = React.useContext(StoreContext);

		const currentBadgerLevel = getBadgerLevelFromBoost(Number(boost));

		const classes = useStyles();
		const rankClasses = useRankStyles(rank, accountDetails?.boostRank)();
		const accountBoost = accountDetails?.boost || 1;

		const Ranks = BADGER_RANKS.slice() //reverse mutates array
			.reverse()
			.map((rank) => (
				<Grid container alignItems="flex-end" key={`${rank.boost}_${rank.name}`}>
					<Grid item>
						<RankConnector boost={Number(boost)} accountBoost={accountBoost} rankBoost={rank.boost} />
					</Grid>
					<Grid item>
						<RankLevel
							key={`${rank.boost}_${rank.name}`}
							name={rank.name}
							color={rank.color}
							boost={rank.boost}
							obtained={accountBoost > 1 && accountBoost >= rank.boost}
							locked={Number(boost) < rank.boost}
						/>
					</Grid>
				</Grid>
			));

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
							<BadgerBoostImage backgroundColor={currentBadgerLevel.color} />
						</div>
						<Typography display="inline" className={rankClasses.fontColor}>
							{currentBadgerLevel.name}
						</Typography>
					</Grid>
				</Grid>
				<Divider className={classes.divider} />
				<Grid item container>
					<RankProgressBar boost={Number(boost)} accountBoost={accountBoost} />
					<div>{Ranks}</div>
				</Grid>

				<Grid item className={classes.viewLeaderBoardContainer} xs>
					<Button fullWidth color="primary" variant="outlined" size="small">
						View Leaderboard
					</Button>
				</Grid>
			</Grid>
		);
	},
);
