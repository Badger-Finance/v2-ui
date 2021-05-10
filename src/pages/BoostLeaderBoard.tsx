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
	const { leaderBoard, user, uiState } = store;
	const { accountDetails } = user;
	const { queueNotification } = uiState;

	const viewRank = (): void => {
		if (!accountDetails || !leaderBoard.data) {
			return;
		}
		if (accountDetails.boostRank > leaderBoard.data.count) {
			queueNotification(`Your address is currently unranked.`, 'info');
			return;
		}
		leaderBoard.setPage(Math.ceil(accountDetails.boostRank / leaderBoard.data.size) - 1);
	};

	return (
		<Container className={classes.rootContainer}>
			<PageHeader title="Badger Boost Leader Board" subtitle="Who is the fiercest Badger?" />
			<div className={classes.leaderboardContainer}>
				<BadgerBoost />
				{accountDetails && (
					<div className={classes.viewContainer}>
						<Button onClick={viewRank} color="primary" variant="outlined" className={classes.viewButton}>
							view
						</Button>
					</div>
				)}
				<div className={classes.description}>
					<Typography>
						Deposit Badger or DIGG to increase your APY and rewards from 1 to 3x. See how you compare to
						fellow Badgers and compete for a higher boost.
					</Typography>
				</div>
				<LeaderBoard />
			</div>
		</Container>
	);
});

export default BoostLeaderBoard;
