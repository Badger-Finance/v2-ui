import { ChartTimeFrame, VaultDTOV3 } from '@badger-dao/sdk';
import { Grid, Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfluenceVaultConfig } from 'mobx/model/vaults/influence-vault-data';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';

import { ChartMode } from '../../mobx/model/vaults/vault-charts';
import { StoreContext } from '../../mobx/stores/store-context';
import ChartContent from '../vault-detail/charts/ChartContent';
import { ChartsHeader } from '../vault-detail/charts/ChartsHeader';
import { VaultChart } from '../vault-detail/charts/VaultChart';
import { CardContainer } from '../vault-detail/styled';
import InfluenceVaultPerfomanceTab from './InfluenceVaultPerfomanceTab';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    flexGrow: 1,
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  tabHeader: { background: 'rgba(0,0,0,.2)' },
  content: {
    flexGrow: 1,
    maxWidth: '100%',
    flexShrink: 0,
    padding: theme.spacing(2, 3),
  },
}));

interface Props {
  vault: VaultDTOV3;
  config: InfluenceVaultConfig;
}

type TabType = 'performance' | 'value';

const InfluenceVaultInfoPanel = ({ vault, config }: Props): JSX.Element => {
  const classes = useStyles();
  const { influenceVaultStore } = useContext(StoreContext);
  const influenceVault = influenceVaultStore.getInfluenceVault(vault.vaultToken);
  const [timeframe, setTimeframe] = useState(ChartTimeFrame.Week);
  const [mode, setMode] = useState<TabType>('performance');

  const handleTimeFrameChange = async (timeframe: ChartTimeFrame) => {
    setTimeframe(timeframe);
    await influenceVaultStore.loadChartInfo(timeframe, vault);
  };

  const valueChart = (
    <Grid container direction="column" className={classes.content}>
      <Grid item container alignItems="center" justifyContent="space-between" className={classes.header}>
        <ChartsHeader mode={ChartMode.Balance} timeframe={timeframe} onTimeframeChange={handleTimeFrameChange} />
      </Grid>
      <Grid item container xs justifyContent="center" alignItems="center">
        <ChartContent data={influenceVault?.vaultChartData ?? []} loading={influenceVault.processingChartData}>
          <VaultChart vault={vault} timeframe={timeframe} chartData={influenceVault?.vaultChartData ?? []} />
        </ChartContent>
      </Grid>
    </Grid>
  );

  useEffect(() => {
    influenceVaultStore.init(vault.vaultToken);
  }, [influenceVaultStore, vault.vaultToken]);

  return (
    <CardContainer className={classes.root}>
      <Tabs
        variant="fullWidth"
        className={classes.tabHeader}
        textColor="primary"
        aria-label="chart view options"
        indicatorColor="primary"
        value={mode}
      >
        <Tab onClick={() => setMode('performance')} value="performance" label="Performance" />
        <Tab onClick={() => setMode('value')} value="value" label="Tokens Managed" />
      </Tabs>
      <Grid container direction="column" className={classes.content}>
        {mode === 'performance' && <InfluenceVaultPerfomanceTab vault={vault} config={config} />}
        {mode === 'value' && valueChart}
      </Grid>
    </CardContainer>
  );
};

export default observer(InfluenceVaultInfoPanel);
