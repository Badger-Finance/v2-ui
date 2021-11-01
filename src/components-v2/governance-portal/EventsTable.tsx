import React from 'react';
import { TimelockEvent } from '../../mobx/model/governance-timelock/timelock-event';
import EventsTableItem from './EventsTableItem';
import { Grid, Typography, List, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
	},
	title: {
		marginTop: theme.spacing(6),
		marginBottom: theme.spacing(2),
	},
	hiddenMobile: {
		display: 'flex',
		alignItems: 'flex-end',
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	list: {
		width: '100%',
		borderRadius: theme.shape.borderRadius,
		overflow: 'hidden',
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1],
		marginBottom: theme.spacing(2),
	},
}));

export interface EventTableProps {
	events?: TimelockEvent[];
}

const EventsTable = ({ events }: EventTableProps): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			<Typography variant="h4" className={classes.title}>
				Recent Timelock Activity
			</Typography>
			<Grid item container xs={12} className={classes.root}>
				<Grid item container xs={12} sm={3}>
					<Typography variant="body2" color="textSecondary">
						Block Number
					</Typography>
				</Grid>
				<Grid item xs={12} sm className={classes.hiddenMobile}>
					<Typography variant="body2" color="textSecondary">
						Event
					</Typography>
				</Grid>
				<Grid item xs={12} sm className={classes.hiddenMobile}>
					<Typography variant="body2" color="textSecondary">
						Action
					</Typography>
				</Grid>
			</Grid>
			<List className={classes.list}>
				{events && events.map((event, i) => <EventsTableItem event={event} key={'event-' + i} />)}
			</List>
		</>
	);
};

export default EventsTable;
