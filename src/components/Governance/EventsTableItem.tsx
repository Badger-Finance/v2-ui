import { TimelockEvent } from '../../mobx/model/governance-timelock/timelock-event';
import EventAction from './EventAction';
import { Grid, Typography, ListItem, makeStyles, Link } from '@material-ui/core';
import { ArrowUpward } from '@material-ui/icons';
import classNames from 'classnames';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
		width: '1100px',
		color: theme.palette.text.secondary
		// textAlign: 'center',
	},
	listItem: {
		padding: theme.spacing(2),
		borderTop: '0.1px solid',
	},
	address: {
		width: theme.spacing(28),
	},
	arrowbox: {
		position: 'relative',
	},
	arrow: {
		position: 'absolute',
		top: theme.spacing(0.5),
		transform: 'rotate(45deg)',
		right: theme.spacing(1),
		color: 'white',
	},
	status: {
		display: 'inline-block',
		width: 'fit-content',
		border: '1px solid',
		borderRadius: '12px',
		padding: '0 5px',
		marginRight: 5,
	},
	Proposed: {
		borderColor: 'yellow',
		color: 'yellow',
	},
	Vetoed: {
		borderColor: 'red',
		color: 'red',
	},
	Executed: {
		borderColor: 'green',
		color: 'green',
	},
}));

export interface EventTableProps {
	event: TimelockEvent;
}

const enum Filters {
	PROPOSED = 'Proposed',
	VETOED = 'Vetoed',
	EXECUTED = 'Executed',
}

const EventsTableItem = ({ event }: EventTableProps): JSX.Element => {
	const classes = useStyles();
	const status = event.status;
	return (
		<ListItem className={classes.listItem}>
			<Grid container item xs={12} className={classes.root} spacing={2}>
				<Grid item xs={3}>
					<div>{event.timeStamp}</div>
					{event.timeRemaining > 0 && <div>{event.timeRemaining} secs remaining</div>}
				</Grid>
				<Grid item xs={3} className={classes.arrowbox}>
					<Typography className={classes.address} variant="body2" color="textSecondary" noWrap>
						{status == Filters.PROPOSED && (
							<div className={classNames([classes.status, classes.Proposed].join(' '))}>
								<b>{status}</b>
							</div>
						)}
						{status == Filters.VETOED && (
							<div className={classNames([classes.status, classes.Vetoed].join(' '))}>
								<b>{status}</b>
							</div>
						)}
						{status == Filters.EXECUTED && (
							<div className={classNames([classes.status, classes.Executed].join(' '))}>
								<b>{status}</b>
							</div>
						)}
						by {event.doneBy}
					</Typography>
					<Link href={'https://etherscan.io/address/' + event.doneBy} target="_blank">
						<ArrowUpward className={classes.arrow} />
					</Link>
				</Grid>
				<Grid item xs={3}>
					<EventAction event={event} />
				</Grid>
				<Grid item xs={3} className={classes.arrowbox}>
					<Typography className={classes.address} variant="body2" color={'textSecondary'} noWrap>
						{event.proposer}
					</Typography>
					<Link href={'https://etherscan.io/address/' + event.proposer} target="_blank">
						<ArrowUpward className={classes.arrow} />
					</Link>
				</Grid>
			</Grid>
		</ListItem>
	);
};

export default EventsTableItem;
