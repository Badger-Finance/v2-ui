import { Box, Grid, Link, makeStyles, Typography } from '@material-ui/core';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import { observer } from 'mobx-react-lite';
import React from 'react';

export interface AddressInfoCardProps {
  title: string;
  address?: string;
  linkAddress?: string;
  onClick?: () => void;
}

const useStyles = makeStyles(() => ({
  linkIcon: {
    display: 'inline-block',
    transform: 'rotate(45deg)',
    color: 'white',
    cursor: 'pointer',
  },
  address: {
    maxWidth: '100px',
    paddingRight: '1px',
  },
}));

const AddressInfoCard: React.FC<AddressInfoCardProps> = observer((props: AddressInfoCardProps) => {
  const classes = useStyles();
  const { title, address, linkAddress, onClick } = props;
  return (
    <div>
      <Typography variant="subtitle2" color="textSecondary">
        {title}
      </Typography>

      <Grid container justifyContent="flex-start">
        <Grid item className={classes.address}>
          <Typography noWrap>{address}</Typography>
        </Grid>
        <Grid item>
          {linkAddress && (
            <Link className={classes.linkIcon} href={linkAddress} target="_blank">
              <ArrowUpward />
            </Link>
          )}
          {!linkAddress && onClick && (
            <Box onClick={onClick} className={classes.linkIcon}>
              <ArrowUpward />
            </Box>
          )}
        </Grid>
      </Grid>
    </div>
  );
});

export default AddressInfoCard;
