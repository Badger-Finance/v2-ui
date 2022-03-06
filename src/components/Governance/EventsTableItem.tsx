import React from 'react';
import { TimelockEvent } from '../../mobx/model/governance-timelock/timelock-event';
import EventAction from './EventAction';
import { Grid, Typography, ListItem, makeStyles, Link } from '@material-ui/core';
import { ArrowUpward } from '@material-ui/icons';

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
    },
    address: {
        width: theme.spacing(28)
    },
    arrowbox: {
        position: 'relative'
    },
    arrow: {
        position: 'absolute',
        top: theme.spacing(0.5),
        transform: 'rotate(45deg)',
        right: theme.spacing(1),
        color: 'white'
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
                    {event.timeStamp}
                </Grid>
                <Grid item xs={3} className={classes.arrowbox}>
                    <Typography className={classes.address} variant="body2" color="textSecondary" noWrap >
                        {event.status} by {event.doneBy}
                    </Typography>
                    <Link href={'https://etherscan.io/address/' + event.doneBy} target="_blank">
                        <ArrowUpward className={classes.arrow} />
                    </Link>
                </Grid>

                <Grid item xs={3} >
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
