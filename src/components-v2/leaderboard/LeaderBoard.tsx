import React from 'react';
import { makeStyles, Paper, Grid, Divider, Typography, Link } from '@material-ui/core';
import LeaderboardAccountInformation from './LeaderboardAccountInformation';
import LeaderboardRanks from './LeaderboardRanks';
import { MAX_BOOST_LEVEL, MIN_BOOST_LEVEL } from '../../config/system/boost-ranks';

const useStyles = makeStyles((theme) => ({
	leaderboardPaper: {
		display: 'flex',
		flexDirection: 'column',
		padding: theme.spacing(3),
		marginBottom: theme.spacing(4),
	},
	divider: {
		margin: theme.spacing(2, 0),
	},
	ranksColumnsTitles: {
		padding: theme.spacing(0, 1),
		marginBottom: theme.spacing(1),
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
}));

export default function LeaderBoard(): JSX.Element {
	const classes = useStyles();
	return (
		<Grid container className={classes.leaderboardPaper} component={Paper}>
			<LeaderboardAccountInformation />

			<Divider className={classes.divider} />

			<Typography color="textSecondary">
				{`Deposit Badger or DIGG to increase your ROI and rewards from ${MIN_BOOST_LEVEL.multiplier}x to ${MAX_BOOST_LEVEL.multiplier}x.
				 See how you compare to fellow Badgers and compete for a higher boost. `}
				<Link
					target="_blank"
					rel="noopener noreferrer"
					href="https://medium.com/badgerdao/badger-boost-power-up-stake-ratio-levels-e0c9802fc5c3"
					color="primary"
				>
					See more.
				</Link>
			</Typography>

			<Divider className={classes.divider} />

			<Grid container className={classes.ranksColumnsTitles}>
				<Grid item xs md={5} lg={4}>
					<Typography color="textPrimary">Rank Title</Typography>
				</Grid>
				<Grid item xs md>
					<Typography color="textPrimary">Badgers</Typography>
				</Grid>
				<Grid item xs md>
					<Typography color="textPrimary">Boost Range</Typography>
				</Grid>
			</Grid>

			<LeaderboardRanks />
		</Grid>
	);
}
