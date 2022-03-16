import { useState, useEffect, useCallback, useMemo } from 'react';
import { TimelockEvent } from 'mobx/model/governance-timelock/timelock-event';
import EventsTableItem from './EventsTableItem';
import { Grid, Typography, List, makeStyles } from '@material-ui/core';
import { Pagination } from './Pagination';

const useStyles = makeStyles((theme) => ({
	infoPaper: {
		paddingTop: theme.spacing(2),
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		flexDirection: 'column',
		maxHeight: '70vh',
		width: '100%',
		overflowX: 'scroll',
	},
	root: {
		padding: theme.spacing(1),
		height: theme.spacing(6),
		width: '1100px',
		textAlign: 'center',
		borderTopLeftRadius: theme.shape.borderRadius,
		borderTopRightRadius: theme.shape.borderRadius,
		background: `${theme.palette.background.paper}`,
	},
	list: {
		width: '1100px',
		overflowY: 'scroll',
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1],
	},
}));

export interface EventTableProps {
	events?: Map<string, TimelockEvent>;
	filters: string[];
}

const EventsTable = ({ events, filters }: EventTableProps): JSX.Element => {
	const classes = useStyles();
	const [eventListShow, setEventListShow] = useState<TimelockEvent[]>([]);
	const [page, setPage] = useState<number>(1);
	let filteredEventList: TimelockEvent[] = useMemo(() => {
		const applyFilter = (eventItem: TimelockEvent) => {
			return filters.includes(eventItem.status);
		};
		let eventList: TimelockEvent[] = [];
		if (events) {
			for (let key of events.keys()) {
				let eventItem = {} as TimelockEvent;
				eventItem = events.get(key) || eventItem;
				eventList.push(eventItem);
			}
		}
		if (filters.length > 0) {
			return eventList.filter(applyFilter);
		} else {
			return eventList;
		}
	}, [events, filters]);

	const rowsPerPage = 8;
	const totalRows = filteredEventList.length;
	const totalPages = Math.ceil(totalRows / rowsPerPage);
	const handlePages = useCallback(
		(updatePage: number) => {
			if (updatePage > totalPages) {
				updatePage = 1;
			} else if (updatePage < 1) {
				updatePage = totalPages;
			}
			let currentEventList: TimelockEvent[] = filteredEventList.slice(
				(updatePage - 1) * rowsPerPage,
				updatePage * rowsPerPage,
			);
			setPage(updatePage);
			setEventListShow(currentEventList);
		},
		[totalPages, filteredEventList],
	);

	useEffect(() => {
		handlePages(1);
	}, [handlePages]);
	return (
		<Grid className={classes.infoPaper} xs={12} item>
			<Grid item container className={classes.root}>
				<Grid item xs={3}>
					<Typography variant="subtitle1" color="textSecondary">
						Timestamp
					</Typography>
				</Grid>
				<Grid item xs={3}>
					<Typography variant="subtitle1" color="textSecondary">
						Status
					</Typography>
				</Grid>
				<Grid item xs={3}>
					<Typography variant="subtitle1" color="textSecondary">
						Action
					</Typography>
				</Grid>
				<Grid item xs={3}>
					<Typography variant="subtitle1" color="textSecondary">
						Proposers
					</Typography>
				</Grid>
			</Grid>

			<List className={classes.list}>
				{eventListShow && eventListShow.map((event, i) => <EventsTableItem event={event} key={'event-' + i} />)}
			</List>

			<Pagination page={page} totalPages={totalPages} handlePagination={handlePages} />
		</Grid>
	);
};

export default EventsTable;
