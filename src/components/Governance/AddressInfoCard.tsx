import React from 'react';
import { Paper, Typography, makeStyles, Box, Link, Grid } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { observer } from 'mobx-react-lite';

export interface AddressInfoCardProps {
    title: string;
    address?: string;
}

const useStyles = makeStyles((theme) => ({

    linkIcon: {
        display: 'inline-block',
        transform: 'translateY(3px)',
    },
}));

const AddressInfoCard: React.FC<AddressInfoCardProps> = observer((props: AddressInfoCardProps) => {
    const classes = useStyles();
    const { title, address } = props;
    return (
        <div >
            <Typography variant="subtitle2" color="textSecondary">
                {title}
            </Typography>

            <Grid container justifyContent="flex-start">
                <Grid item xs={8}>
                    <Box width="100%">
                        <Typography noWrap>
                            {address}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs="auto">
                    <Link className={classes.linkIcon} href={'https://etherscan.io/address/' + address} target="_blank">
                        <ExitToAppIcon />
                    </Link>
                </Grid>
            </Grid>
        </div>
    );
});

export default AddressInfoCard;
