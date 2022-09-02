import { VaultDTO, VaultState } from '@badger-dao/sdk';
import { Box, Link, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { isInfluenceVault } from 'components-v2/InfluenceVault/InfluenceVaultUtil';
import YieldBearingRewards from 'components-v2/YieldBearingVaults/YieldBearingRewards';
import { getYieldBearingVaultBySourceName } from 'components-v2/YieldBearingVaults/YieldBearingVaultUtil';
import { FLAGS } from 'config/environment';
import { useVaultInformation } from 'hooks/useVaultInformation';
import { StoreContext } from 'mobx/stores/store-context';
import { numberWithCommas } from 'mobx/utils/helpers';
import React, { MouseEvent, useContext, useState } from 'react';

import VaultApyInformation from '../VaultApyInformation';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    cursor: 'pointer',
  },
  apr: {
    cursor: 'default',
    fontSize: 16,
  },
  apyInfo: {
    marginLeft: 5,
  },
  aprDisplay: {
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
    },
  },
  projectedApr: {
    fontSize: 10,
    marginTop: 3,
    color: '#FFFFFF99',
  },
  yieldBearingRewards: {
    fontSize: 12,
    marginTop: 5,
    width: '100%',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'flex-start',
      },
      '& img': {
        marginRight: 5,
      },
    },
  },
}));

interface Props {
  vault: VaultDTO;
  isDisabled?: boolean;
}

const VaultItemApr = ({ vault }: Props): JSX.Element => {
  const classes = useStyles();
  const [showApyInfo, setShowApyInfo] = useState(false);
  const [openYieldBearingRewardsModal, setOpenYieldBearingRewardsModal] = useState(false);
  const { projectedVaultBoost, vaultBoost } = useVaultInformation(vault);

  const store = useContext(StoreContext);
  const { vaults } = store;
  const yieldSourcesAprTotal = vault.sourcesApy.reduce((max, source) => {
    const yieldVault = getYieldBearingVaultBySourceName(source.name);
    if (yieldVault !== undefined) {
      const current = vaults.getVault(yieldVault.vaultId)?.apy ?? 0;
      if (current > max) {
        max = current;
      }
    }
    return max;
  }, 0);

  const handleApyInfoClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setShowApyInfo(true);
  };

  const handleYieldBearingRewardsClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOpenYieldBearingRewardsModal(true);
    return false;
  };

  const handleClose = () => {
    setShowApyInfo(false);
  };

  if (!vault.apr) {
    return (
      <Typography className={classes.apr} variant="body1" color={'textPrimary'}>
        --%
      </Typography>
    );
  }

  const isNewVault = vault.state === VaultState.Experimental || vault.state === VaultState.Guarded;
  const aprDisplay = isNewVault ? (
    <>
      <img src={'assets/icons/new-vault.svg'} alt="New Vault" /> New Vault
    </>
  ) : (
    `${numberWithCommas(vaultBoost.toFixed(2))}%`
  );
  const isInfluence = isInfluenceVault(vault.vaultToken);

  return (
    <Box
      display="flex"
      alignItems={FLAGS.APY_EVOLUTION ? 'flex-end' : 'flex-start'}
      flexDirection="column"
      className={classes.root}
      onClick={(e) => e.stopPropagation()}
    >
      <Box className={classes.aprDisplay} display="flex" width="100%" onClick={handleApyInfoClick}>
        <Typography variant={isNewVault ? 'subtitle1' : 'body1'} color={'textPrimary'} display="inline">
          {aprDisplay}
        </Typography>
        <img src="/assets/icons/apy-info.svg" className={classes.apyInfo} alt="apy info icon" />
      </Box>
      {FLAGS.APY_EVOLUTION && yieldSourcesAprTotal > 0 && (
        <Box className={classes.yieldBearingRewards}>
          <Link color="primary" onClick={handleYieldBearingRewardsClick}>
            <img width="9" src="assets/icons/yield-bearing-rewards.svg" alt="Yield-Bearing Rewards" /> Yield-Bearing
            Rewards.
          </Link>
          <Typography onClick={handleApyInfoClick} variant="inherit">
            Rewards earn up to {yieldSourcesAprTotal.toFixed(2)}%
          </Typography>
        </Box>
      )}
      {!FLAGS.APY_EVOLUTION && !isInfluence && projectedVaultBoost !== null && (
        <Box display="flex" onClick={handleApyInfoClick}>
          <Typography className={classes.projectedApr}>
            Current: {`${numberWithCommas(projectedVaultBoost.toFixed(2))}%`}
          </Typography>
        </Box>
      )}
      <VaultApyInformation
        open={showApyInfo}
        vault={vault}
        boost={vaultBoost}
        projectedBoost={projectedVaultBoost}
        onClose={handleClose}
      />
      <YieldBearingRewards
        open={openYieldBearingRewardsModal}
        onModalClose={() => setOpenYieldBearingRewardsModal(false)}
      />
    </Box>
  );
};

export default VaultItemApr;
