import { ChartTimeFrame } from '@badger-dao/sdk';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import { ChartMode } from '../../../mobx/model/vaults/vault-charts';
import { ChartModeTitles } from '../utils';
import { ChartTimeframeControls } from './ChartTimeframeControls';

const useStyles = makeStyles((theme) => ({
  titleText: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },
  },
  buttonGroupContainer: {
    textAlign: 'end',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(1),
      textAlign: 'center',
    },
  },
}));

interface Props {
  mode: ChartMode;
  timeframe: ChartTimeFrame;
  onTimeframeChange: (timeframe: ChartTimeFrame) => void;
}

export const ChartsHeader = observer(({ mode, timeframe, onTimeframeChange }: Props): JSX.Element => {
  const {
    vaults: { vaultsFilters },
  } = useContext(StoreContext);

  const classes = useStyles();
  const boostMode = vaultsFilters.showAPR ? 'APR' : 'APY';

  let description;
  switch (mode) {
    case ChartMode.AccountBalance:
      description = 'Deposited assets';
      break;
    case ChartMode.Ratio:
      description = 'bToken to deposit token ratio';
      break;
    case ChartMode.Value:
      description = 'Total assets under management';
      break;
    case ChartMode.Balance:
      description = 'Total tokens under management';
      break;
    default:
      description = `Vault Boost ${boostMode} breakdown`;
  }

  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Grid container item xs={12} sm={6} direction="column" className={classes.titleText}>
        <Typography variant="h6">{ChartModeTitles[mode]}</Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </Grid>
      {mode !== ChartMode.BoostMultiplier && (
        <Grid item xs={12} sm={6} className={classes.buttonGroupContainer}>
          <ChartTimeframeControls value={timeframe} onChange={onTimeframeChange} />
        </Grid>
      )}
    </Grid>
  );
});
