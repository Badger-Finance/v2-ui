import { Button, Container, makeStyles, Typography } from '@material-ui/core';
import PageHeader from 'components-v2/common/PageHeader';
import LeaderBoard from 'components-v2/leaderboard/LeaderBoard';
import { observer } from 'mobx-react-lite';
import BadgerBoost from '../components-v2/common/BadgerBoost';
import React, { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';

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

const BoostLeaderBoard = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { user } = store;
	const { accountDetails } = user;

	return (
		<Container className={classes.rootContainer}>
			<PageHeader title="Badger Boost Leader Board" subtitle="Who is the fiercest Badger?" />
			<div className={classes.leaderboardContainer}>
				<BadgerBoost />
				{accountDetails && (
					<div className={classes.viewContainer}>
						<Button
							onClick={() =>
								window.open(
									'https://medium.com/@badgerdao/introducing-badger-boost-v1-and-leaderboard-d1e15343b3ec',
								)
							}
							color="primary"
							variant="outlined"
							className={classes.viewButton}
						>
							How does it work?
						</Button>
					</div>
				)}
				<div className={classes.description}>
					<Typography>
						Deposit Badger or DIGG to increase your ROI and rewards from 1 to 3x. See how you compare to
						fellow Badgers and compete for a higher boost.
					</Typography>
				</div>
				<LeaderBoard />
			</div>
		</Container>
	);
});

export default BoostLeaderBoard;
