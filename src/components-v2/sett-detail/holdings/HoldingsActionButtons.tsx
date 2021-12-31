import React from 'react';
import { SettActionButton } from '../../common/SettActionButtons';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from '../../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
  deposit: {
    marginRight: theme.spacing(1),
  },
  withdraw: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  canDeposit: boolean;
}

export const HoldingsActionButtons = ({ canDeposit }: Props): JSX.Element => {
  const { settDetail } = React.useContext(StoreContext);
  const { canUserDeposit, canUserWithdraw } = settDetail;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {canDeposit && (
        <SettActionButton
          fullWidth
          className={classes.deposit}
          color="primary"
          variant={canUserDeposit ? 'contained' : 'outlined'}
          disabled={!canUserDeposit}
          onClick={() => settDetail.toggleDepositDialog()}
        >
          Deposit
        </SettActionButton>
      )}
      <SettActionButton
        className={classes.withdraw}
        fullWidth
        color="primary"
        variant="outlined"
        disabled={!canUserWithdraw}
        onClick={() => settDetail.toggleWithdrawDialog()}
      >
        Withdraw
      </SettActionButton>
    </div>
  );
};
