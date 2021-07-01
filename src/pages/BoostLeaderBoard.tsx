import React from 'react';
import { Container, makeStyles } from '@material-ui/core';
import PageHeader from 'components-v2/common/PageHeader';
import { LeaderBoard } from 'components-v2/leaderboard/LeaderBoard';

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
	viewContainer: {
		textAlign: 'center',
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
	},
	description: {
		width: '75%',
		margin: 'auto',
		marginBottom: theme.spacing(2),
		[theme.breakpoints.down('sm')]: {
			width: '80%',
		},
	},
	viewButton: {
		fontSize: '.8rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '.6rem',
		},
	},
}));

const BoostLeaderBoard = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Container className={classes.rootContainer}>
			<PageHeader title="Badger Boost Leader Board" subtitle="Who is the fiercest Badger?" />
			<div className={classes.leaderboardContainer}>
				<LeaderBoard />
			</div>
		</Container>
	);
};

export default BoostLeaderBoard;
