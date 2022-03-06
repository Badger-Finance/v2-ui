import React from 'react';
import { Typography, makeStyles, Link, Grid } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import ArrowUpward from '@material-ui/icons/ArrowUpward';

export interface AddressInfoCardProps {
    title: string;
    address?: string;
    linkAddress: string;
}

const useStyles = makeStyles((theme) => ({

    linkIcon: {
        display: 'inline-block',
        transform: 'rotate(45deg)',
        color: 'white'
    },
    address: {
        maxWidth: '100px',
        paddingRight: '1px'
    },
}));

const AddressInfoCard: React.FC<AddressInfoCardProps> = observer((props: AddressInfoCardProps) => {
    const classes = useStyles();
    const { title, address, linkAddress } = props;
    return (
        <div >
            <Typography variant="subtitle2" color="textSecondary">
                {title}
            </Typography>

            <Grid container justifyContent="flex-start">
                <Grid item className={classes.address}>
                    <Typography noWrap>
                        {address}
                    </Typography>
                </Grid>
                <Grid item >
                    <Link className={classes.linkIcon} href={linkAddress} target="_blank">
                        <ArrowUpward />
                    </Link>
                </Grid>
            </Grid>
        </div>
    );
});

export default AddressInfoCard;
