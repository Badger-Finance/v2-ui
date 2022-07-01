import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { Link, makeStyles, Typography } from '@material-ui/core';
import CallMadeIcon from '@material-ui/icons/CallMade';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import { StoreContext } from '../../mobx/stores/store-context';

const useStyles = makeStyles({
  link: {
    display: 'flex',
    alignItems: 'center',
  },
  text: {
    marginRight: 4,
  },
  icon: {
    margin: 'auto 0',
    fontSize: 14,
  },
});

interface Props {
  name: string;
  receipt: TransactionReceipt;
}

const TxCompletedToast = ({ receipt, name }: Props): JSX.Element => {
  const {
    network: { network },
  } = useContext(StoreContext);
  const classes = useStyles();

  return (
    <div>
      <Typography variant="body1">{name}</Typography>
      <Link
        className={classes.link}
        variant="body2"
        color="textSecondary"
        href={`${network.explorer}/tx/${receipt.transactionHash}`}
        target="_blank"
        rel="noreferrer"
      >
        <span className={classes.text}>Open in explorer</span>
        <CallMadeIcon className={classes.icon} />
      </Link>
    </div>
  );
};

export default observer(TxCompletedToast);
