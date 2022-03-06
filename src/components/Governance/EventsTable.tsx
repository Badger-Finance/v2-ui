import { useState, useEffect } from 'react';
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
        maxHeight: "70vh",
        width: '100%',
        overflowX: 'scroll'
    },
    root: {
        padding: theme.spacing(1),
        height: theme.spacing(6),
        width: '1100px',
        textAlign: 'center',
        borderTopLeftRadius: theme.shape.borderRadius,
        borderTopRightRadius: theme.shape.borderRadius,
        background: `${theme.palette.background.paper}`
    },
    list: {
        width: '1100px',
        overflowY: 'scroll',
        background: `${theme.palette.background.paper}`,
        padding: 0,
        boxShadow: theme.shadows[1]
    },
}));

export interface EventTableProps {
    events?: Map<string, TimelockEvent>;
    filters: string[];
}

const EventsTable = ({ events, filters }: EventTableProps): JSX.Element => {
    const classes = useStyles();
    const [eventListShow, setEventListShow] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    let eventList: any[] = [];
    if (events) {
        for (let key of events.keys()) {
            var eventitem = {} as TimelockEvent;
            eventitem = events.get(key) || eventitem;
            eventList.push(<EventsTableItem event={eventitem} key={key} />)
        }
    }
    let filteredEventList: any[] = [];
    if (filters.length == 0) {
        filteredEventList = eventList;
    }
    else {
        if (events) {
            for (let key of events.keys()) {
                var eventitem = {} as TimelockEvent;
                eventitem = events.get(key) || eventitem;
                if (filters.includes(eventitem.status)) {
                    filteredEventList.push(<EventsTableItem event={eventitem} key={key} />)
                }
            }
        }
    }
    const rowsPerPage = 8;
    const totalRows = filteredEventList.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const handlePages = (updatePage: number) => {
        if (updatePage > totalPages) {
            updatePage = 1;
        }
        else if (updatePage < 1) {
            updatePage = totalPages;
        }
        setPage(updatePage);
        var currentEventList: any[] = [];
        for (let i = (updatePage - 1) * rowsPerPage; i < updatePage * rowsPerPage; i++) {
            currentEventList.push(filteredEventList[i]);
        }
        setEventListShow(currentEventList);
    }

    useEffect(() => {
        handlePages(1);
    }, [totalRows]);
    return (
        <Grid className={classes.infoPaper} xs={12} item>
            <Grid item container className={classes.root}>
                <Grid item xs={3} >
                    <Typography variant="subtitle1" color="textSecondary">
                        Timestamp
                    </Typography>
                </Grid>
                <Grid item xs={3} >
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
                {eventListShow}
            </List>

            <Pagination
                page={page}
                totalPages={totalPages}
                handlePagination={handlePages}
            />
        </Grid>
    );
};

export default EventsTable;
