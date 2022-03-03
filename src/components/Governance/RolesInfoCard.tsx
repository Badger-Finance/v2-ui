import React from 'react';
import { Paper, Typography, makeStyles, Box, Link, Grid } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { observer } from 'mobx-react-lite';

export interface RolesInfoCardProps {
    title: string;
    addresses: Array<string>;
}
interface AddressListItemProps {
    address?: string;
}
const useStyles = makeStyles((theme) => ({
    infoPaper: {
        padding: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    linkIcon: {
        display: 'inline-block',
        transform: 'translateY(3px)',
    },
}));
const AddressListItem = observer((props: AddressListItemProps) => {
    const classes = useStyles();
    const { address } = props;
    return (
        <Grid container justifyContent="center">
            <Grid item xs={9}>
                <Box width="100%">
                    <Typography variant="h5" noWrap>
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
    );
});
const RolesInfoCard: React.FC<RolesInfoCardProps> = observer((props: RolesInfoCardProps) => {
    const classes = useStyles();
    const { title, addresses } = props;
    return (
        <Paper elevation={2} className={classes.infoPaper}>
            <Typography variant="subtitle1" color="textPrimary">
                {title}
            </Typography>
            <Grid>
                {addresses.map((object, i) => <AddressListItem address={object} key={i} />)}
            </Grid>


        </Paper>
    );
});

export default RolesInfoCard;
