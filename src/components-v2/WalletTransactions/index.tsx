import { Button, Grid, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import { StoreContext } from '../../mobx/stores/store-context';
import WalletTransaction from '../WalletTransaction';

const useStyles = makeStyles((theme) => ({
  clearButton: {
    textTransform: 'none',
  },
  title: {
    marginBottom: theme.spacing(1),
  },
}));

const WalletTransactions = (): JSX.Element => {
  const { transactions } = useContext(StoreContext);
  const { recentTransactions, transactionCount } = transactions;
  const classes = useStyles();

  return (
    <Grid container direction="column">
      <Grid
        item
        container
        justifyContent="space-between"
        alignItems="center"
        className={classes.title}
      >
        <Typography variant="subtitle2" color="textSecondary" display="inline">
          Recent Transactions
        </Typography>
        {transactionCount > 0 && (
          <Button
            color="primary"
            variant="text"
            classes={{ label: classes.clearButton }}
            onClick={() => transactions.clearTransactions()}
          >
            Clear
          </Button>
        )}
      </Grid>
      {transactionCount === 0 ? (
        <Typography variant="subtitle2" color="textSecondary">
          Your transactions will appear here..
        </Typography>
      ) : (
        Object.values(recentTransactions)
          .slice(-3)
          .map((transaction, index) => (
            <Grid item key={transaction.addedTime + index}>
              <WalletTransaction transaction={transaction} />
            </Grid>
          ))
      )}
    </Grid>
  );
};

export default observer(WalletTransactions);
