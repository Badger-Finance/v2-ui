import { VaultDTOV3 } from '@badger-dao/sdk';
import { Box, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import MarkupText from 'components-v2/common/MarkupText';
import { yieldToValueSource } from 'components-v2/VaultApyInformation';
import { InfluenceVaultConfig } from 'mobx/model/vaults/influence-vault-data';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

import routes from '../../config/routes';
import { StoreContext } from '../../mobx/stores/store-context';
import { numberWithCommas } from '../../mobx/utils/helpers';
import ChartContent from '../vault-detail/charts/ChartContent';
import SpecItem from '../vault-detail/specs/SpecItem';
import { StyledHelpIcon } from '../vault-detail/styled';
import InfluenceVaultApyBreakdown from './InfluenceVaultApyBreakdown';
import InfluenceVaultChart from './InfluenceVaultChart';
import InfluenceVaultListModal from './InfluenceVaultListModal';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  divider: {
    width: '100%',
    margin: '10px 0',
  },
  firstParagraph: {
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 20,
  },
  liquidity: {
    marginTop: 20,
  },
  content: {
    marginTop: 40,
    display: 'flex',
    flexGrow: 1,
    maxWidth: '100%',
    flexShrink: 0,
    justifyContent: 'center',
  },
  performanceChart: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    background: '#181818',
    padding: theme.spacing(2),
    borderRadius: '5px',
  },
}));

interface Props {
  vault: VaultDTOV3;
  config: InfluenceVaultConfig;
}

const InfluenceVaultPerfomanceTab = ({ vault, config }: Props): JSX.Element => {
  const { vaults, lockedDeposits, influenceVaultStore } = useContext(StoreContext);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const classes = useStyles();
  const sortedSources = vault.apy.sources
    .slice()
    .sort((a, b) => (b.performance.grossYield > a.performance.grossYield ? 1 : -1));
  const apy = vault.apy;
  const lockedBalance = lockedDeposits.getLockedDepositBalances(vault.underlyingToken);
  const { processingEmissions, emissionsSchedules, swapPercentage } = influenceVaultStore.getInfluenceVault(
    vault.vaultToken,
  );
  const underlyingTokenSymbol = vaults.getToken(vault.underlyingToken).symbol;
  const divisorToken = vaults.getToken(vault.vaultToken).symbol;
  const { router } = useContext(StoreContext);
  const handleLinkClick = (link: string) => {
    router.goTo(routes.vaultDetail, { vaultName: link }, { chain: router.queryParams?.chain });
  };

  return (
    <Grid container direction="column" className={classes.root}>
      <Grid item container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">Strategy Summary</Typography>
          <Divider className={classes.divider} />
          <Typography className={classes.firstParagraph} variant="body2" color="textSecondary">
            <MarkupText text={config.perfomanceConfig.body1} onClick={handleLinkClick} />
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <MarkupText text={config.perfomanceConfig.body2} onClick={handleLinkClick} />
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid item container>
            <Box width="100%" display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body1" display="inline">
                APY
              </Typography>
              <Typography variant="body1" display="inline">
                {numberWithCommas(String(apy.grossYield.toFixed(2)))}%
              </Typography>
            </Box>
            <Divider className={classes.divider} />
            {sortedSources.map(yieldToValueSource).map((source) => (
              <React.Fragment key={source.name}>
                <InfluenceVaultApyBreakdown vault={vault} source={source} />
                <Divider className={classes.divider} />
              </React.Fragment>
            ))}
          </Grid>
          <Grid item container direction="column" className={classes.liquidity}>
            <Typography variant="body1" display="inline">
              Liquidity
            </Typography>
            <Divider className={classes.divider} />
            <SpecItem
              name={
                <Box component="span" display="flex" justifyContent="center" alignItems="center">
                  {underlyingTokenSymbol} Available for Withdrawal
                  <StyledHelpIcon onClick={() => setInfoDialogOpen(true)} />
                </Box>
              }
              value={
                lockedBalance ? (
                  numberWithCommas(lockedBalance.balanceDisplay(5))
                ) : (
                  <Skeleton width={50} variant="rect" />
                )
              }
            />
            {config.perfomanceConfig.swapPercentageLabel.length !== 0 && (
              <SpecItem
                name={<MarkupText text={config.perfomanceConfig.swapPercentageLabel} onClick={handleLinkClick} />}
                value={swapPercentage ? swapPercentage : <Skeleton width={50} variant="rect" />}
              />
            )}
          </Grid>
        </Grid>
      </Grid>

      <Grid item className={classes.content}>
        <div className={classes.performanceChart}>
          {config.enableChart ? (
            <div>
              <Typography align="center" variant="body2">
                Performance By Voting Round, Tokens per 100 {divisorToken}
              </Typography>
              <ChartContent loading={processingEmissions} data={emissionsSchedules ?? null}>
                {emissionsSchedules && (
                  <InfluenceVaultChart emissions={emissionsSchedules} chartInitialSlice={config.chartInitialSlice} />
                )}
              </ChartContent>
            </div>
          ) : (
            <Typography align="center" variant="body1" className={classes.comingSoonText}>
              Graph Coming Soon
            </Typography>
          )}
        </div>
      </Grid>
      <InfluenceVaultListModal
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        config={config.withdrawModalConfig}
      />
    </Grid>
  );
};

export default observer(InfluenceVaultPerfomanceTab);
