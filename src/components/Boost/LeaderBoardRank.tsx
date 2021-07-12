import React from 'react';
import BigNumber from 'bignumber.js';
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';

import { getColorFromComparison } from './utils';
import { BadgerBoostImage } from './BadgerBoostImage';
import { RankProgressBar } from './RankProgressBar';
import { RankList } from './RankList';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import { getRankFromBoost } from '../../utils/componentHelpers';

const useRankStyles = (currentRank?: string, accountRank?: BigNumber.Value) => {
	return makeStyles((theme) => {
		if (!currentRank || !accountRank) {
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
					toBeComparedValue: accountRank,
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
		height: 470,
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
	placeholderProgressBar: {
		position: 'relative',
		alignSelf: 'stretch',
		width: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	lockedRankItem: {
		opacity: 0.5,
	},
	unlockedRankItem: {
		opacity: 1,
	},
}));

interface Props {
	rank?: string;
	boost?: string;
	onRankClick: (boost: number) => void;
}

export const LeaderBoardRank = observer(
	({ boost = '1', rank, onRankClick }: Props): JSX.Element => {
		const {
			router,
			user: { accountDetails },
		} = React.useContext(StoreContext);

		const classes = useStyles();
		const accountRank = accountDetails?.boostRank;
		const accountBoost = accountDetails?.boost;
		const currentBadgerLevel = getRankFromBoost(Number(boost));
		const rankClasses = useRankStyles(rank, accountRank)();

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
							<BadgerBoostImage boost={currentBadgerLevel.boostRangeStart} />
						</div>
						<Typography display="inline" className={rankClasses.fontColor}>
							{currentBadgerLevel.name}
						</Typography>
					</Grid>
				</Grid>
				<Divider className={classes.divider} />
				<Grid item container>
					{accountBoost ? (
						<RankProgressBar boost={Number(boost)} accountBoost={accountBoost} />
					) : (
						<div className={classes.placeholderProgressBar} />
					)}
					<Grid item xs>
						<RankList currentBoost={boost} accountBoost={accountBoost} onRankClick={onRankClick} />
					</Grid>
				</Grid>

				<Grid item className={classes.viewLeaderBoardContainer} xs>
					<Button
						fullWidth
						color="primary"
						variant="outlined"
						size="small"
						onClick={() => {
							router.goTo(routes.boostLeaderBoard);
						}}
					>
						View Leaderboard
					</Button>
				</Grid>
			</Grid>
		);
	},
);
