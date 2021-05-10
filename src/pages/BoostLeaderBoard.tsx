import { Container, makeStyles } from '@material-ui/core';
import PageHeader from 'components-v2/common/PageHeader';
import LeaderBoard from 'components-v2/leaderboard/LeaderBoard';
import { observer } from 'mobx-react-lite';
import BadgerBoost from '../components-v2/common/BadgerBoost';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	rootContainer: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(30),
			paddingTop: theme.spacing(3),
		},
	},
	leaderboardContainer: {
		[theme.breakpoints.up('md')]: {
			marginTop: theme.spacing(5),
			maxWidth: '70%',
		},
		marginTop: theme.spacing(3),
		margin: 'auto',
	},
}));

const BoostLeaderBoard = observer(() => {
	const classes = useStyles();

	return (
		<Container className={classes.rootContainer}>
			<PageHeader title="Badger Boost Leader Board" subtitle="Who is the fiercest Badger?" />
			<div className={classes.leaderboardContainer}>
				<BadgerBoost />
				<LeaderBoard />
			</div>
		</Container>
	);
});

export default BoostLeaderBoard;
