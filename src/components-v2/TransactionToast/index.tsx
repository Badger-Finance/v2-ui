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

export const TX_COMPLETED_TOAST_DURATION = 8000;

interface Props {
  title: string;
  hash: string;
}

const TransactionToast = ({ hash, title }: Props): JSX.Element => {
  const {
    network: { config },
  } = useContext(StoreContext);
  const classes = useStyles();

  return (
    <div>
      <Typography variant="body1">{title}</Typography>
      <Link
        className={classes.link}
        variant="body2"
        color="textSecondary"
        href={`${config.explorerUrl}/tx/${hash}`}
        target="_blank"
        rel="noreferrer"
      >
        <span className={classes.text}>Open in explorer</span>
        <CallMadeIcon className={classes.icon} />
      </Link>
    </div>
  );
};

export default observer(TransactionToast);
