import { ChartTimeFrame, VaultDTOV3, VaultSnapshot, VaultType } from '@badger-dao/sdk';
import { Grid, Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';

import { ChartMode } from '../../../mobx/model/vaults/vault-charts';
import { CardContainer } from '../styled';
import { ChartModeTitles } from '../utils';
import { BoostChart } from './BoostChart';
import ChartContent from './ChartContent';
import { ChartsHeader } from './ChartsHeader';
import { VaultChart } from './VaultChart';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
  },
  content: {
    flexGrow: 1,
    maxWidth: '100%',
    flexShrink: 0,
    padding: theme.spacing(2, 3),
  },
  tabHeader: { background: 'rgba(0,0,0,.2)' },
  header: {
    marginBottom: theme.spacing(3),
  },
  chartContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

interface Props {
  vault: VaultDTOV3;
}

export const ChartsCard = observer(({ vault }: Props): JSX.Element => {
  const { vaultCharts } = useContext(StoreContext);
  const isBoostable = vault.type === VaultType.Boosted;

  const classes = useStyles();
  const [chartData, setChartData] = useState<VaultSnapshot[]>([]);
  const [mode, setMode] = useState(ChartMode.Value);
  const [loading, setLoading] = useState(!isBoostable);
  const [timeframe, setTimeframe] = useState(ChartTimeFrame.Week);

  const handleFetch = (fetchedData: VaultSnapshot[]) => {
    setChartData(fetchedData);
    setLoading(false);
  };

  const handleFetchError = (error: Error) => {
    setLoading(false);
    console.error(error);
  };

  useEffect(() => {
    setLoading(true);
    vaultCharts.search(vault, timeframe).then(handleFetch).catch(handleFetchError);
  }, [vault, timeframe, vaultCharts]);

  return (
    <CardContainer className={classes.root}>
      {isBoostable && (
        <Tabs
          variant="fullWidth"
          className={classes.tabHeader}
          textColor="primary"
          aria-label="chart view options"
          indicatorColor="primary"
          value={mode}
        >
          <Tab
            onClick={() => setMode(ChartMode.Value)}
            value={ChartMode.Value}
            label={ChartModeTitles[ChartMode.Value]}
          />
          <Tab
            onClick={() => setMode(ChartMode.BoostMultiplier)}
            value={ChartMode.BoostMultiplier}
            label={ChartModeTitles[ChartMode.BoostMultiplier]}
          />
        </Tabs>
      )}
      <Grid container direction="column" className={classes.content}>
        <Grid item container alignItems="center" justifyContent="space-between" className={classes.header}>
          <ChartsHeader mode={mode} timeframe={timeframe} onTimeframeChange={setTimeframe} />
        </Grid>
        <Grid item xs className={classes.chartContainer}>
          <ChartContent data={chartData} loading={loading}>
            <>
              {mode === ChartMode.Value ? (
                <VaultChart vault={vault} timeframe={timeframe} chartData={chartData} />
              ) : (
                <BoostChart vault={vault} />
              )}
            </>
          </ChartContent>
        </Grid>
      </Grid>
    </CardContainer>
  );
});
