import { VaultData, VaultDTOV3 } from '@badger-dao/sdk';
import { Grid, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { useVaultInformation } from 'hooks/useVaultInformation';
import React from 'react';
import { shouldDisplayEarnings } from 'utils/componentHelpers';

import { numberWithCommas } from '../../../mobx/utils/helpers';
import { HoldingItem } from './HoldingItem';
import { HoldingsActionButtons } from './HoldingsActionButtons';
import { NoHoldings } from './NoHoldings';
import { TokenDistributionIcon } from './TokenDistributionIcon';

const useStyles = makeStyles((theme) => ({
  settInfoTitle: {
    fontSize: 24,
    fontWeight: 500,
  },
  helpIcon: {
    fontSize: 16,
    marginLeft: theme.spacing(0.5),
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

interface Props {
  vault: VaultDTOV3;
  userData: VaultData;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export const Holdings = ({ userData, vault, onDepositClick, onWithdrawClick }: Props): JSX.Element | null => {
  const isMediumSizeScreen = useMediaQuery(useTheme().breakpoints.up('sm'));
  const classes = useStyles();
  const { depositBalance } = useVaultInformation(vault);

  if (depositBalance.tokenBalance.eq(0)) {
    return (
      <Grid container>
        <NoHoldings vault={vault} onDepositClick={onDepositClick} />
      </Grid>
    );
  }

  const { earnedBalance, earnedValue } = userData;
  const decimals = depositBalance.token.decimals;

  return (
    <Grid container>
      <Grid container>
        <Typography className={classes.settInfoTitle}>Your Vault Info</Typography>
      </Grid>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} sm>
          <HoldingItem
            vault={vault}
            name="Total Deposited"
            balance={depositBalance.balanceDisplay(5)}
            value={depositBalance.balanceValueDisplay() ?? '0'}
            helpIcon={<TokenDistributionIcon settBalance={userData} />}
          />
        </Grid>
        {shouldDisplayEarnings(vault, userData) && (
          <Grid item xs={12} sm>
            <HoldingItem
              vault={vault}
              name="Total Earned"
              balance={earnedBalance.toFixed(decimals)}
              value={`~$${numberWithCommas(earnedValue.toFixed(2))}`}
            />
          </Grid>
        )}
        {isMediumSizeScreen && (
          <Grid item xs={12} sm>
            <HoldingsActionButtons vault={vault} onDepositClick={onDepositClick} onWithdrawClick={onWithdrawClick} />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
