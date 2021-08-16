import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import PageHeader from 'components-v2/common/PageHeader';
import LeaderBoard from 'components-v2/leaderboard/LeaderBoard';
import { HeaderContainer, LayoutContainer } from '../components-v2/common/Containers';

const useStyles = makeStyles((theme) => ({
	leaderboardContainer: {
		[theme.breakpoints.up('md')]: {
			marginTop: theme.spacing(2),
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
		<LayoutContainer>
			<Grid container>
				<HeaderContainer item xs={12}>
					<PageHeader title="Badger Boost Leader Board" subtitle="Who is the fiercest Badger?" />
				</HeaderContainer>
				<div className={classes.leaderboardContainer}>
					<LeaderBoard />
				</div>
			</Grid>
		</LayoutContainer>
	);
};

export default BoostLeaderBoard;
