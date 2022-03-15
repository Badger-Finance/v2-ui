import { TimelockEvent } from '../../mobx/model/governance-timelock/timelock-event';
import { Grid, Typography, ListItem, makeStyles, Link } from '@material-ui/core';
import { ArrowUpward } from '@material-ui/icons';
import clsx from 'clsx';
import { Filters } from '../../mobx/model/governance-timelock/vote-filters';
const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
		width: '1100px',
		color: theme.palette.text.secondary,
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
	proposed: {
		borderColor: 'yellow',
		color: 'yellow',
	},
	vetoed: {
		borderColor: 'red',
		color: 'red',
	},
	executed: {
		borderColor: 'green',
		color: 'green',
	},
	action: {
		textAlign: 'center',
	},
}));

export interface EventTableProps {
	event: TimelockEvent;
}

const EventsTableItem = ({ event }: EventTableProps): JSX.Element => {
	const classes = useStyles();
	const status = event.status;
	const status_class = clsx({
		[classes.status]: true,
		[classes.proposed]: status === Filters.PROPOSED,
		[classes.vetoed]: status === Filters.VETOED,
		[classes.executed]: status === Filters.EXECUTED,
	});
	return (
		<ListItem className={classes.listItem}>
			<Grid container item xs={12} className={classes.root} spacing={2}>
				<Grid item xs={3}>
					<div>{event.timeStamp}</div>
					{event.timeRemaining > 0 && <div>{event.timeRemaining} secs remaining</div>}
				</Grid>
				<Grid item xs={3} className={classes.arrowbox}>
					<Typography className={classes.address} variant="body2" color="textSecondary" noWrap>
						<div className={status_class}>
							<b>{status}</b>
						</div>
						by {event.doneBy}
					</Typography>
					<Link href={'https://etherscan.io/address/' + event.doneBy} target="_blank">
						<ArrowUpward className={classes.arrow} />
					</Link>
				</Grid>
				<Grid item xs={3} className={classes.action}>
					{event.event}
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
