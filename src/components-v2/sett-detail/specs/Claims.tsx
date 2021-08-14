import React from 'react';
import { Grid, Link, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import dayjs from 'dayjs';

import { StyledDivider } from '../styled';
import { ESTIMATED_REWARDS_FREQUENCY } from '../../../config/constants';
import { StoreContext } from '../../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
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
		borderRadius: 4,
		fontSize: 12,
	},
	rewardContainer: {
		textAlign: 'end',
	},
	mediumDelayedReward: {
		backgroundColor: '#D97706',
	},
	highlyDelayedReward: {
		backgroundColor: theme.palette.error.main,
	},
}));

enum DelaySeverity {
	none = 'none',
	medium = 'medium',
	high = 'high',
}

const calculateDelaySeverity = (delay: number): DelaySeverity => {
	if (delay >= 4) {
		return DelaySeverity.high;
	}

	if (delay >= 2 && delay < 4) {
		return DelaySeverity.medium;
	}

	return DelaySeverity.none;
};

const calculateDifferenceInHoursFromCycle = (cycle: Date): number => Math.abs(dayjs(cycle).diff(dayjs(), 'hours'));

export const Claims = observer(
	(): JSX.Element => {
		const { rewards } = React.useContext(StoreContext);
		const classes = useStyles();

		const differenceInHoursFromCycle = calculateDifferenceInHoursFromCycle(rewards.badgerTree.lastCycle);
		const delaySeverity = calculateDelaySeverity(differenceInHoursFromCycle);

		const isDelayed = delaySeverity !== DelaySeverity.none;

		const delayStyles = {
			[DelaySeverity.high]: classes.highlyDelayedReward,
			[DelaySeverity.medium]: classes.mediumDelayedReward,
			[DelaySeverity.none]: null,
		};

		return (
			<Grid container className={classes.root}>
				<Typography>Claims</Typography>
				<StyledDivider />
				<Grid container alignItems="center">
					<Grid container item xs={7}>
						<Typography color="textSecondary" className={classes.rewardsFrequency}>
							Reward Frequency
						</Typography>
						{isDelayed && (
							<Typography className={classes.frequencyDetail} variant="caption" color="textSecondary">
								This Sett’s rewards are currently taking longer than usual.
							</Typography>
						)}
						<Link className={classes.infoLink}>See more</Link>
					</Grid>
					<Grid className={classes.rewardContainer} item xs>
						<Typography className={clsx(classes.reward, delayStyles[delaySeverity])} display="inline">
							{`~${ESTIMATED_REWARDS_FREQUENCY} Hours`}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
		);
	},
);
