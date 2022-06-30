import React, { useState } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { StyledDivider } from '../styled';
import { ESTIMATED_REWARDS_FREQUENCY } from '../../../config/constants';
import { StoreContext } from '../../../mobx/store-context';
import { calculateDelaySeverity, calculateDifferenceInHoursFromCycle } from '../utils';
import BveCvxFrequencyInfo from '../../BveCvxFrequencyInfo';

const useStyles = makeStyles((theme) => ({
	rewardsFrequency: {
		width: '100%',
	},
	frequencyDetail: {
		fontSize: 11,
		width: '100%',
	},
	infoLink: {
		fontSize: 11,
	},
	reward: {
		padding: '2px 4px',
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
	noneDelayedReward: {
		border: `1px solid ${theme.palette.divider}`,
	},
	linkIcon: {
		fontSize: 11,
	},
	linkContent: {
		display: 'flex',
		alignItems: 'center',
	},
}));

enum DelaySeverity {
	none = 'none',
	medium = 'medium',
	high = 'high',
}

export const Claims = observer((): JSX.Element => {
	const { rewards } = React.useContext(StoreContext);
	const [infoDialogOpen, setInfoDialogOpen] = useState(false);
	const classes = useStyles();

	const differenceInHoursFromCycle = calculateDifferenceInHoursFromCycle(rewards.badgerTree.lastCycle);
	const delaySeverity = calculateDelaySeverity(differenceInHoursFromCycle);

	const isDelayed = delaySeverity !== DelaySeverity.none;

	const delayStyles = {
		[DelaySeverity.high]: classes.highlyDelayedReward,
		[DelaySeverity.medium]: classes.mediumDelayedReward,
		[DelaySeverity.none]: classes.noneDelayedReward,
	};

	return (
		<Grid container>
			<Grid container alignItems="center">
				<Grid container item xs={7}>
					<Typography>Reward Frequency</Typography>
				</Grid>
				<Grid className={classes.rewardContainer} item xs>
					<Typography className={clsx(classes.reward, delayStyles[delaySeverity])} display="inline">
						{`~${ESTIMATED_REWARDS_FREQUENCY} Hours`}
					</Typography>
				</Grid>
			</Grid>
			<StyledDivider />
			<Typography className={classes.frequencyDetail} variant="caption" color="textSecondary">
				{isDelayed
					? 'This Sett’s rewards are currently taking longer than usual.'
					: 'This Sett’s rewards are currently being processed.'}
			</Typography>
			{/*TODO: Currently in the badger docs files the vaults slugs are different from the app.
			   Re-enable this when the badger docs are updated with the same slugs so we can just do
			   href=docs.badger/{vault.slug}
			 */}
			{/*<Link*/}
			{/*	className={classes.infoLink}*/}
			{/*	href="https://badger.wiki/setts#b52fee58e850405abd9701068fd93f37"*/}
			{/*	target="_blank"*/}
			{/*	rel="noreferrer"*/}
			{/*>*/}
			{/*	<div className={classes.linkContent}>*/}
			{/*		<span>See more</span>*/}
			{/*		<ChevronRightIcon className={classes.linkIcon} />*/}
			{/*	</div>*/}
			{/*</Link>*/}
			<BveCvxFrequencyInfo open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} />
		</Grid>
	);
});
