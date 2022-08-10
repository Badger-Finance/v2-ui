import { VaultDTO, VaultState } from '@badger-dao/sdk';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isInfluenceVault } from 'components-v2/InfluenceVault/InfluenceVaultUtil';
import { useVaultInformation } from 'hooks/useVaultInformation';
import { numberWithCommas } from 'mobx/utils/helpers';
import React, { MouseEvent, useState } from 'react';

import VaultApyInformation from '../VaultApyInformation';

const useStyles = makeStyles({
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
  projectedApr: {
    fontSize: 10,
    marginTop: 3,
    color: '#FFFFFF99',
  },
});

interface Props {
  vault: VaultDTO;
  isDisabled?: boolean;
}

const VaultItemApr = ({ vault }: Props): JSX.Element => {
  const classes = useStyles();
  const [showApyInfo, setShowApyInfo] = useState(false);
  const { projectedVaultBoost, vaultBoost } = useVaultInformation(vault);

  const handleApyInfoClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setShowApyInfo(true);
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
  const aprDisplay = isNewVault ? 'New Vault' : `${numberWithCommas(vaultBoost.toFixed(2))}%`;
  const isInfluence = isInfluenceVault(vault.vaultToken);

  return (
    <Box
      display="flex"
      alignItems="flex-start"
      flexDirection="column"
      onClick={handleApyInfoClick}
      className={classes.root}
    >
      <Box>
        <Typography variant={isNewVault ? 'subtitle1' : 'body1'} color={'textPrimary'} display="inline">
          {aprDisplay}
        </Typography>
        <img src="/assets/icons/apy-info.svg" className={classes.apyInfo} alt="apy info icon" />
      </Box>
      {!isInfluence && projectedVaultBoost !== null && (
        <Box display="flex">
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
    </Box>
  );
};

export default VaultItemApr;
