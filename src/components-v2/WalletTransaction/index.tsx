import { Box, CircularProgress, Grid, Link, makeStyles, Typography } from '@material-ui/core';
import CallMadeIcon from '@material-ui/icons/CallMade';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import { Transaction } from '../../mobx/model/ui/transaction';
import { StoreContext } from '../../mobx/stores/store-context';

const useStyles = makeStyles((theme) => ({
  success: {
    color: theme.palette.success.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    margin: 'auto 0',
    fontSize: 14,
  },
  text: {
    marginRight: 4,
  },
}));

interface Props {
  transaction: Transaction;
}

const WalletTransaction = ({ transaction }: Props): JSX.Element => {
  const {
    chain: { config },
  } = useContext(StoreContext);
  const classes = useStyles();
  const explorer = config.explorerUrl;

  const statusIcon =
    transaction?.status === 0 ? (
      <ErrorOutlineIcon className={classes.error} />
    ) : (
      <CheckCircleOutlineIcon className={classes.success} />
    );

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="subtitle1" color="textSecondary">
          <Link
            className={classes.link}
            color="inherit"
            href={`${explorer}/tx/${transaction.hash}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className={classes.text}>{transaction.name}</span>
            <CallMadeIcon className={classes.icon} />
          </Link>
        </Typography>
        {transaction.description && (
          <Typography variant="subtitle2" color="textSecondary">
            {transaction.description}
          </Typography>
        )}
      </Box>
      {transaction.status === undefined ? <CircularProgress size={14} /> : statusIcon}
    </Grid>
  );
};

export default observer(WalletTransaction);
