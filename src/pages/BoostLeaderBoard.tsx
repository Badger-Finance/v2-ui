import { Box, Button, Container, Divider, Link, makeStyles, Paper, Typography } from '@material-ui/core';
import PageHeader from 'components-v2/common/PageHeader';
import LeaderBoard from 'components-v2/leaderboard/LeaderBoard';
import { observer } from 'mobx-react-lite';
import BadgerBoost from '../components-v2/common/BadgerBoost';
import React, { useContext } from 'react';
import views from '../config/routes';
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
		padding: theme.spacing(3),
	},
	viewContainer: {
		textAlign: 'center',
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
	},
	description: {
		color: theme.palette.text.secondary,
		marginBottom: theme.spacing(2),
	},
	dividerBottom: {
		marginBottom: theme.spacing(2),
	},
	dividerTop: {
		marginBottom: theme.spacing(2),
		marginTop: theme.spacing(2),
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
			<Paper className={classes.leaderboardContainer}>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<BadgerBoost />
					{accountDetails && (
						<div className={classes.viewContainer}>
							<Button
								onClick={() => store.router.goTo(views.boost)}
								color="primary"
								variant="contained"
								className={classes.viewButton}
							>
								Calculate Boost
							</Button>
						</div>
					)}
				</Box>
				{accountDetails && <Divider className={classes.dividerTop} />}
				<div className={classes.description}>
					<Typography>
						Deposit Badger or DIGG to increase your ROI and rewards from 1 to 3x. See how you compare to
						fellow Badgers and compete for a higher boost.
						{` `}
						<Link
							target="_blank"
							rel="noopener"
							href="https://medium.com/@badgerdao/introducing-badger-boost-v1-and-leaderboard-d1e15343b3ec"
						>
							Read more.
						</Link>
					</Typography>
				</div>
				<Divider className={classes.dividerBottom} />
				<LeaderBoard />
			</Paper>
		</Container>
	);
});

export default BoostLeaderBoard;
