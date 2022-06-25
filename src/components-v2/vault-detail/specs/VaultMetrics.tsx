import { VaultDTO } from '@badger-dao/sdk';
import { Collapse, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';

import { StoreContext } from 'mobx/stores/store-context';
import { numberWithCommas } from '../../../mobx/utils/helpers';
import { StyledDivider } from '../styled';
import VaultDepositedAssets from '../../VaultDepositedAssets';

const useStyles = makeStyles((theme) => ({
  root: {
    wordBreak: 'break-all',
    display: 'flex',
    flexDirection: 'column',
  },
  amount: {
    fontSize: 28,
    lineHeight: '1.334',
  },
  currencyIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
  },
  submetric: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  submetricValue: {
    marginTop: theme.spacing(0.5),
    marginRight: theme.spacing(1),
  },
  submetricType: {
    paddingBottom: theme.spacing(0.08),
  },
  title: {
    paddingBottom: theme.spacing(0.15),
    fontSize: '1.25rem',
  },
  showMoreContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    cursor: 'pointer',
  },
  showMore: {
    color: theme.palette.primary.main,
    fontSize: 12,
    padding: theme.spacing(0.2),
  },
}));

interface Props {
  vault: VaultDTO;
}

const VaultMetrics = observer(({ vault }: Props): JSX.Element => {
  const { lockedDeposits } = React.useContext(StoreContext);
  const classes = useStyles();

	const [showMore, setShowMore] = useState(true);
	const expandText = showMore ? 'Hide' : 'Show More';
	const shownBalance = lockedDeposits.getLockedDepositBalances(vault.underlyingToken);

  return (
    <Grid container className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        Vault Details
      </Typography>
      <StyledDivider />
      <VaultDepositedAssets vault={vault} />
      <Typography variant="body2">Assets Deposited</Typography>
      <div className={classes.showMoreContainer}>
        <div className={classes.showMore} onClick={() => setShowMore(!showMore)}>
          {expandText}
        </div>
      </div>
      <Collapse in={showMore}>
        <div className={classes.submetric}>
          <Typography variant="body1" className={classes.submetricValue}>
            {vault.pricePerFullShare.toFixed(4)}
          </Typography>
          <Typography variant="caption" className={classes.submetricType}>
            tokens per share
          </Typography>
        </div>
        {shownBalance && (
          <div className={classes.submetric}>
            <Typography variant="body1" className={classes.submetricValue}>
              {numberWithCommas(shownBalance.balanceDisplay(5))}
            </Typography>
            <Typography variant="caption" className={classes.submetricType}>
              tokens withdrawable
            </Typography>
          </div>
        )}
      </Collapse>
    </Grid>
  );
});

export default VaultMetrics;
