import { VaultDTOV3 } from '@badger-dao/sdk';
import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isInfluenceVault } from 'components-v2/InfluenceVault/InfluenceVaultUtil';
import VaultApyInformation from 'components-v2/VaultApyInformation';
import { useVaultInformation } from 'hooks/useVaultInformation';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { MouseEvent, useState } from 'react';

import { numberWithCommas } from '../../../mobx/utils/helpers';
import VaultDepositedAssets from '../../VaultDepositedAssets';
import { StyledDivider } from '../styled';

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
  assetsText: {
    paddingBottom: theme.spacing(1),
  },
  apyInfo: {
    marginLeft: 5,
  },
  aprDisplay: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
    },
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

interface Props {
  vault: VaultDTOV3;
}

const VaultMetrics = observer(({ vault }: Props): JSX.Element => {
  const { lockedDeposits } = React.useContext(StoreContext);
  const classes = useStyles();

  const shownBalance = lockedDeposits.getLockedDepositBalances(vault.underlyingToken);
  const [showApyInfo, setShowApyInfo] = useState(false);
  const handleApyInfoClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setShowApyInfo(true);
  };
  const handleClose = () => {
    setShowApyInfo(false);
  };
  const { projectedVaultBoost, vaultBoost } = useVaultInformation(vault);
  const isInfluence = isInfluenceVault(vault.vaultToken);
  const useHistoricAPY = projectedVaultBoost === null || isInfluence;

  const aprDisplay = !useHistoricAPY
    ? `${numberWithCommas(projectedVaultBoost.toFixed(2))}%`
    : `${numberWithCommas(vaultBoost.toFixed(2))}%`;

  return (
    <Grid container className={classes.root}>
      <Grid container>
        <Grid item xs={8}>
          <Typography variant="h6" className={classes.title}>
            Vault Details
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Box className={classes.aprDisplay} display="flex" width="100%" onClick={handleApyInfoClick}>
            <Typography variant={'body1'} color={'textPrimary'} display="inline">
              {aprDisplay}
            </Typography>
            <img
              src="/assets/icons/apy-info.svg"
              className={classes.apyInfo}
              alt="apy info icon"
              width="12"
              height="24"
            />
          </Box>
        </Grid>
      </Grid>
      <StyledDivider />
      <VaultDepositedAssets vault={vault} />
      <Typography variant="body2" className={classes.assetsText}>
        Assets Deposited
      </Typography>
      <div className={classes.submetric}>
        <Typography variant="caption" className={classes.submetricValue}>
          {new Date(vault.lastHarvest).toLocaleString()}
        </Typography>
        <Typography variant="caption" className={classes.submetricType}>
          last harvest time
        </Typography>
      </div>
      <div className={classes.submetric}>
        <Typography variant="caption" className={classes.submetricValue}>
          {vault.pricePerFullShare.toFixed(4)}
        </Typography>
        <Typography variant="caption" className={classes.submetricType}>
          tokens per share
        </Typography>
      </div>
      {shownBalance && (
        <div className={classes.submetric}>
          <Typography variant="caption" className={classes.submetricValue}>
            {numberWithCommas(shownBalance.balanceDisplay(5))}
          </Typography>
          <Typography variant="caption" className={classes.submetricType}>
            tokens withdrawable
          </Typography>
        </div>
      )}
      <VaultApyInformation
        open={showApyInfo}
        vault={vault}
        boost={vaultBoost}
        projectedBoost={projectedVaultBoost}
        onClose={handleClose}
        removeGoToVaultButton={true}
      />
    </Grid>
  );
});

export default VaultMetrics;
