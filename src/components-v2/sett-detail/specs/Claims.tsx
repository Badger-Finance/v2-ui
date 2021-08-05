import React from 'react';
import { Grid, Link, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
	root: {
		marginBottom: 20,
	},
	rewardsFrequency: {
		fontSize: 12,
		width: '100%',
	},
	frequencyDetail: {
		fontSize: 10,
		width: '100%',
	},
	infoLink: {
		fontSize: 10,
		width: '100%',
	},
	reward: {
		padding: '4px 6px',
		backgroundColor: 'red',
		borderRadius: 4,
		fontSize: 12,
	},
	rewardContainer: {
		textAlign: 'end',
	},
}));

export const Claims = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			<Typography>Claims</Typography>
			<StyledDivider />
			<Grid container alignItems="center">
				<Grid container item xs={7}>
					<Typography color="textSecondary" className={classes.rewardsFrequency}>
						Reward Frequency
					</Typography>
					<Typography className={classes.frequencyDetail} variant="caption" color="textSecondary">
						This Sett’s rewards are currently taking longer than usual.
					</Typography>
					<Link className={classes.infoLink}>See more</Link>
				</Grid>
				<Grid className={classes.rewardContainer} item xs>
					<Typography className={classes.reward} display="inline">
						~2 Hours
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
};
