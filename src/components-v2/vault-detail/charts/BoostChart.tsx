import { VaultDTOV3 } from '@badger-dao/sdk';
import { makeStyles } from '@material-ui/core';
import { format } from 'd3-format';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { MAX_BOOST } from '../../../config/system/boost-ranks';
import { calculateUserStakeRatio } from '../../../utils/boost-ranks';
import BaseAreaChart from './BaseAreaChart';

const useStyles = makeStyles((theme) => ({
  tooltipContainer: {
    background: 'white',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
}));

const boostCheckpoints = Array.from(Array(61)).map((_, i) => i * 50);

const yScaleFormatter = format('^.2%');
// short visual trick to just show 1 as min boost instead of 0 graph wise - there is no impact
const xScaleFormatter = (value: number): string => (value === 0 ? '1' : value.toString());

const BoostTooltip = observer(({ active, payload }: TooltipProps<ValueType, NameType>) => {
  const {
    vaults: { vaultsFilters },
  } = useContext(StoreContext);
  const classes = useStyles();

  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const { x, y } = payload[0].payload;
  const xValue = x === 0 ? 1 : x;
  const mode = vaultsFilters.showAPR ? 'APR' : 'APY';

  const stakeRatio = `${(calculateUserStakeRatio(xValue) * 100).toFixed(2)}%`;
  return (
    <div className={classes.tooltipContainer}>
      <span>Badger Boost: {xValue}</span>
      <span>Stake Ratio: {stakeRatio}</span>
      <span>
        Boosted {mode}: {yScaleFormatter(y)}
      </span>
    </div>
  );
});

interface Props {
  vault: VaultDTOV3;
}

export const BoostChart = observer(({ vault }: Props): JSX.Element | null => {
  const { user, wallet } = useContext(StoreContext);

  const { apy } = vault;
  const { isConnected } = wallet;

  const base = apy.baseYield;
  const mode = 'APY';
  const boostSources = apy.sources;

  const boostableApr = boostSources
    .filter((s) => s.boostable)
    .map((s) => s.performance.baseYield)
    .reduce((total, apr) => total + apr, 0);

  const baseApr = base - boostableApr;

  const boostableMinApr = boostSources
    .filter((s) => s.boostable)
    .map((s) => s.performance.minYield)
    .reduce((total, apr) => total + apr, 0);
  const boostableMaxApr = boostSources
    .filter((s) => s.boostable)
    .map((s) => s.performance.maxYield)
    .reduce((total, apr) => total + apr, 0);

  const range = boostableMaxApr - boostableMinApr;

  const boostData = boostCheckpoints.map((checkpoint) => {
    const rangeScalar = (checkpoint === 0 ? 1 : checkpoint) / MAX_BOOST;
    return {
      x: checkpoint,
      y: (baseApr + rangeScalar * range) / 100,
    };
  });

  const userBoost = user.accountDetails?.boost ?? 1;
  const userRangeScalar = userBoost / MAX_BOOST;
  const userApr = (baseApr + userRangeScalar * range) / 100;

  const yRefs = isConnected
    ? [{ value: userApr, label: `Your ${mode} (${userApr.toFixed(2)}%)` }]
    : [{ value: base / 100, label: `Baseline ${mode} (${base.toFixed(2)}%)` }];
  const xRefs = isConnected ? [{ value: userBoost, label: 'Your Boost' }] : [];

  return (
    <BaseAreaChart
      title={`Badger Boost ${mode}`}
      data={boostData}
      xFormatter={xScaleFormatter}
      yFormatter={yScaleFormatter}
      width="99%" // needs to be 99% see https://github.com/recharts/recharts/issues/172#issuecomment-307858843
      customTooltip={<BoostTooltip />}
      yReferences={yRefs}
      xReferences={xRefs}
    />
  );
});
