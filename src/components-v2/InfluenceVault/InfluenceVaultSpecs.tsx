import { VaultDTO } from '@badger-dao/sdk';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

import { StoreContext } from '../../mobx/stores/store-context';
import { numberWithCommas } from '../../mobx/utils/helpers';
import SpecItem from '../vault-detail/specs/SpecItem';
import VaultDetailLinks from '../vault-detail/specs/VaultDetailLinks';
import { VaultToken } from '../vault-detail/specs/VaultToken';
import { CardContainer, StyledDivider, StyledHelpIcon } from '../vault-detail/styled';
import VaultDepositedAssets from '../VaultDepositedAssets';
import InfluenceVaultFees from './InfluenceVaultFees';
import InfluenceVaultListModal from './InfluenceVaultListModal';
import { getInfluenceVaultConfig } from './InfluenceVaultUtil';

interface Props {
  vault: VaultDTO;
}

const useStyles = makeStyles((theme) => ({
  specContainer: {
    padding: theme.spacing(2),
  },
  specItem: {
    marginTop: 16,
  },
  token: {
    '& h6': {
      fontSize: 12,
      fontWeight: 400,
    },
    marginBottom: 0,
  },
  title: {
    paddingBottom: theme.spacing(0.15),
    fontSize: '1.25rem',
  },
}));

const InfluenceVaultSpecs = ({ vault }: Props): JSX.Element => {
  const { lockedDeposits, vaults } = useContext(StoreContext);
  const [withdrawInfoOpen, setWithdrawInfoOpen] = useState(false);
  const [frequencyInfoOpen, setFrequencyInfoOpen] = useState(false);
  const lockedBalance = lockedDeposits.getLockedDepositBalances(vault.underlyingToken);
  const underlyingTokenSymbol = vaults.getToken(vault.underlyingToken).symbol;
  const config = getInfluenceVaultConfig(vault.vaultToken);
  const classes = useStyles();

  return (
    <CardContainer>
      <Grid container direction="column" className={classes.specContainer}>
        <Grid item xs>
          <Typography variant="h6" className={classes.title}>
            Vault Details
          </Typography>
          <StyledDivider />
          <VaultDepositedAssets vault={vault} />
          <Typography variant="body2">Assets Deposited</Typography>
        </Grid>
        <Grid item xs className={classes.specItem}>
          <Typography className={classes.title}>Tokens</Typography>
          <StyledDivider />
          <Grid container>
            {vault.tokens.map((token, index) => (
              <VaultToken className={classes.token} key={`${vault.name}-${token.name}-${index}`} token={token} />
            ))}
          </Grid>
          <SpecItem name="Token Ratio" value={vault.pricePerFullShare.toFixed(4)} />
          <SpecItem
            name={
              <Box component="span" display="flex" justifyContent="center" alignItems="center">
                {underlyingTokenSymbol} Available for Withdrawal
                <StyledHelpIcon onClick={() => setWithdrawInfoOpen(true)} />
              </Box>
            }
            value={
              lockedBalance ? numberWithCommas(lockedBalance.balanceDisplay(0)) : <Skeleton variant="text" width={30} />
            }
          />
        </Grid>
        <Grid item xs className={classes.specItem}>
          <InfluenceVaultFees vault={vault} />
        </Grid>
        <Grid item xs className={classes.specItem}>
          <Box display="flex" alignItems="center">
            <Typography>Reward Frequency</Typography>
            <StyledHelpIcon onClick={() => setFrequencyInfoOpen(true)} />
          </Box>
          <StyledDivider />
          <Grid container direction="column">
            {config.rewardFrequencies.map(({ name, value }, index) => (
              <SpecItem key={index} name={name} value={value} />
            ))}
          </Grid>
        </Grid>
        <Grid item xs className={classes.specItem}>
          <VaultDetailLinks vault={vault} />
        </Grid>
      </Grid>
      <InfluenceVaultListModal
        open={withdrawInfoOpen}
        onClose={() => setWithdrawInfoOpen(false)}
        config={config.withdrawModalConfig}
      />
      <InfluenceVaultListModal
        open={frequencyInfoOpen}
        onClose={() => setFrequencyInfoOpen(false)}
        config={config.rewardFrequenciesModalConfig}
      />
    </CardContainer>
  );
};

export default observer(InfluenceVaultSpecs);
