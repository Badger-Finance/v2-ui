import React, { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Divider, Grid, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { OptimizerBody } from './OptimizerBody';
import { StoreContext } from '../../mobx/store-context';
import { StakeInformation } from './StakeInformation';
import { OptimizerHeader } from './OptimizerHeader';
import { formatWithoutExtraZeros } from '../../mobx/utils/helpers';
import { calculateMultiplier, calculateNativeToMatchMultiplier } from '../../utils/boost-ranks';
import { MIN_BOOST_LEVEL } from '../../config/system/boost-ranks';

const useStyles = makeStyles((theme) => ({
  calculatorContainer: {
    width: '100%',
    boxSizing: 'border-box',
    padding: theme.spacing(3),
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      height: '100%',
    },
  },
  divider: {
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(3, 0, 0, 1),
    },
    margin: theme.spacing(3, 0),
  },
  placeholderContainer: {
    width: '50%',
    margin: 'auto',
    padding: theme.spacing(3),
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  placeholderText: {
    marginBottom: theme.spacing(2),
  },
  stakeInformationCardContainer: {
    [theme.breakpoints.up('lg')]: {
      flexGrow: 0,
      maxWidth: '29%',
      flexBasis: '29%',
    },
  },
}));

export const Optimizer = observer((): JSX.Element => {
  const {
    user: { accountDetails },
    onboard,
  } = useContext(StoreContext);

  const classes = useStyles();
  const [multiplier, setMultiplier] = useState(MIN_BOOST_LEVEL.multiplier);
  const [native, setNative] = useState('0');
  const [nonNative, setNonNative] = useState('0');
  const [nativeToAdd, setNativeToAdd] = useState<string>();
  const [showBouncingMessage, setShowBouncingMessage] = useState(false);

  const resetToDisconnectedWalletDefaults = () => {
    setNative('0');
    setNonNative('0');
    setNativeToAdd(undefined);
    setMultiplier(MIN_BOOST_LEVEL.multiplier);
    return;
  };

  const setNativeToMatchMultiplier = useCallback(
    (targetBoost: number) => {
      const numericNative = Number(native);
      const numericNonNative = Number(nonNative);

      if (isNaN(numericNative) || isNaN(numericNonNative)) {
        return;
      }

      const nativeToAdd = calculateNativeToMatchMultiplier(numericNative, numericNonNative, targetBoost);
      setNativeToAdd(nativeToAdd.toString());
    },
    [native, nonNative],
  );

  const updateMultiplier = (newNative: string, newNonNative: string) => {
    const numberNewNative = Number(newNative);
    const numericNewNonNative = Number(newNonNative);

    if (isNaN(numberNewNative) || isNaN(numericNewNonNative) || numericNewNonNative === 0) {
      setMultiplier(MIN_BOOST_LEVEL.multiplier);
      return;
    }

    setMultiplier(calculateMultiplier(numberNewNative, numericNewNonNative));
  };

  const handleReset = () => {
    if (!accountDetails) {
      resetToDisconnectedWalletDefaults();
      return;
    }

    const { nativeBalance, nonNativeBalance, boost } = accountDetails;

    setNativeToAdd(undefined);
    setNative(formatWithoutExtraZeros(nativeBalance, 4));
    setNonNative(formatWithoutExtraZeros(nonNativeBalance, 4));
    setMultiplier(boost);
  };

  const handleRankClick = (rankBoost: number) => {
    if (!nonNative || Number(nonNative) === 0) {
      setShowBouncingMessage(true);
      return;
    }

    setNativeToMatchMultiplier(rankBoost);
  };

  const handleNativeChange = (change: string) => {
    setNative(change);
    setNativeToAdd(undefined);

    if (nonNative) {
      updateMultiplier(change, nonNative);
    }
  };

  const handleNonNativeChange = (change: string) => {
    setNonNative(change);
    setNativeToAdd(undefined);

    if (native) {
      updateMultiplier(native, change);
    }
  };

  // load store holdings by default once they're available
  useEffect(() => {
    // wallet was disconnected so we reset values to no wallet defaults
    if (!onboard.isActive()) {
      resetToDisconnectedWalletDefaults();
      return;
    }

    if (!accountDetails) return;

    const { nativeBalance, nonNativeBalance, boost } = accountDetails;

    setNative(formatWithoutExtraZeros(nativeBalance, 4));
    setNonNative(formatWithoutExtraZeros(nonNativeBalance, 4));
    setMultiplier(boost);
  }, [accountDetails, onboard, onboard.address]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg>
        <Grid container component={Paper} className={classes.calculatorContainer}>
          <Grid item>
            <OptimizerHeader multiplier={multiplier} onReset={handleReset} />
          </Grid>
          <Divider className={classes.divider} />
          <Grid item container xs direction="column" justifyContent="center">
            <OptimizerBody
              multiplier={multiplier}
              native={native || ''}
              nonNative={nonNative || ''}
              nativeToAdd={nativeToAdd}
              showMessageBounce={showBouncingMessage}
              onNativeChange={handleNativeChange}
              onNonNativeChange={handleNonNativeChange}
              onBounceAnimationEnd={() => setShowBouncingMessage(false)}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.stakeInformationCardContainer}>
        <StakeInformation native={native} nonNative={nonNative} onRankClick={handleRankClick} />
      </Grid>
    </Grid>
  );
});
