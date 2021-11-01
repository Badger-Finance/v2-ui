import React from 'react';
import { TimelockEvent } from '../../mobx/model/governance-timelock/timelock-event';
import EventAction from './EventAction';
import { Grid, Typography, ListItem, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
	},
	listItem: {
		padding: 0,
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2),
		'&:last-child div': {
			borderBottom: 0,
		},
	},
	mobileLabel: {
		textAlign: 'right',
		paddingRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
	},
	name: {
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
}));

export interface EventTableProps {
	event: TimelockEvent;
}

const EventsTableItem = ({ event }: EventTableProps): JSX.Element => {
	const classes = useStyles();

	return (
		<ListItem className={classes.listItem}>
			<Grid container className={classes.root}>
				<Grid container item xs={12}>
					<Grid item xs={12} sm={3} className={classes.name} container>
						{event.blockNumber}
					</Grid>
					<Grid item className={classes.mobileLabel} xs={6} md>
						<Typography variant="body2" color="textSecondary">
							Event
						</Typography>
					</Grid>
					<Grid item xs={6} md>
						{event.event}
					</Grid>
					<Grid item className={classes.mobileLabel} xs={6} md>
						<Typography variant="body2" color={'textSecondary'}>
							Action
						</Typography>
					</Grid>
					<Grid item xs={6} md>
						<EventAction event={event} />
					</Grid>
				</Grid>
			</Grid>
		</ListItem>
	);
};

export default EventsTableItem;
