import React from 'react';
import { TimelockEvent } from '../../mobx/model/governance-timelock/timelock-event';
import EventAction from './EventAction';
import { Grid, Typography, ListItem, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(2),
        width: '1100px',
        textAlign: 'center'
    },
    listItem: {
        padding: theme.spacing(2),
        borderTop: '0.1px solid',
        '&:last-child div': {
            borderBottom: 0,
        },
    }
}));

export interface EventTableProps {
    event: TimelockEvent;
}

const EventsTableItem = ({ event }: EventTableProps): JSX.Element => {
    const classes = useStyles();
    console.log(event);
    return (
        <ListItem className={classes.listItem}>
            <Grid container item xs={12} className={classes.root} spacing={2} >

                <Grid item xs={3}>
                    {event.blockNumber}
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary" noWrap>
                        {event.status} by {event.doneBy}
                    </Typography>
                </Grid>

                <Grid item xs={3} >
                    <EventAction event={event} />
                </Grid>
                <Grid item xs={3} >
                    <Typography variant="body2" color={'textSecondary'} noWrap>
                        {event.proposer}
                    </Typography>
                </Grid>


            </Grid>
        </ListItem>
    );
};

export default EventsTableItem;
