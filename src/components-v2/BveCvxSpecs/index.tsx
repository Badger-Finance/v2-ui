import { VaultDTO } from '@badger-dao/sdk';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useReducer } from 'react';

import { numberWithCommas } from '../../mobx/utils/helpers';
import BveCvxFees from '../BveCvxFees';
import BveCvxFrequencyInfo from '../BveCvxFrequencyInfo';
import BveCvxWithdrawalInfo from '../BveCvxWithdrawalInfo';
import SpecItem from '../vault-detail/specs/SpecItem';
import VaultDetailLinks from '../vault-detail/specs/VaultDetailLinks';
import { VaultToken } from '../vault-detail/specs/VaultToken';
import { CardContainer, StyledDivider, StyledHelpIcon } from '../vault-detail/styled';
import VaultDepositedAssets from '../VaultDepositedAssets';

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

const BveCvxSpecs = ({ vault }: Props): JSX.Element => {
  const { lockedDeposits } = useContext(StoreContext);
  const [withdrawInfoDisplayed, toggleWithdrawInfo] = useReducer((previous) => !previous, false);
  const [frequencyInfoDisplayed, toggleFrequencyInfo] = useReducer((previous) => !previous, false);
  const lockedBalance = lockedDeposits.getLockedDepositBalances(vault.underlyingToken);
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
                CVX Available for Withdrawal
                <StyledHelpIcon onClick={toggleWithdrawInfo} />
              </Box>
            }
            value={
              lockedBalance ? numberWithCommas(lockedBalance.balanceDisplay(0)) : <Skeleton variant="text" width={30} />
            }
          />
        </Grid>
        <Grid item xs className={classes.specItem}>
          <BveCvxFees vault={vault} />
        </Grid>
        <Grid item xs className={classes.specItem}>
          <Box display="flex" alignItems="center">
            <Typography>Reward Frequency</Typography>
            <StyledHelpIcon onClick={toggleFrequencyInfo} />
          </Box>
          <StyledDivider />
          <Grid container direction="column">
            <SpecItem name="bveCVX, BADGER" value="Bi-Weekly" />
            <SpecItem name="bcvxCRV" value="Per Harvest, ~5 days" />
          </Grid>
        </Grid>
        <Grid item xs className={classes.specItem}>
          <VaultDetailLinks vault={vault} />
        </Grid>
      </Grid>
      <BveCvxWithdrawalInfo open={withdrawInfoDisplayed} onClose={toggleWithdrawInfo} />
      <BveCvxFrequencyInfo open={frequencyInfoDisplayed} onClose={toggleFrequencyInfo} />
    </CardContainer>
  );
};

export default observer(BveCvxSpecs);
