import { VaultDTO } from '@badger-dao/sdk';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { InfluenceVaultFeeConfig } from 'mobx/model/vaults/influence-vault-data';
import React from 'react';

import { StrategyFee } from '../../mobx/model/system-config/stategy-fees';
import { getVaultStrategyFee } from '../../mobx/utils/fees';
import { formatStrategyFee } from '../../utils/componentHelpers';
import SpecItem from '../vault-detail/specs/SpecItem';
import { StyledDivider } from '../vault-detail/styled';
import InfluenceVaultFee from './InfluenceVaultFee';

const useStyles = makeStyles((theme) => ({
  title: {
    paddingBottom: theme.spacing(0.15),
    fontSize: '1.25rem',
  },
  spec: {
    fontSize: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  subSpec: {
    paddingLeft: 15,
    marginBottom: theme.spacing(0.5),
  },
}));

interface Props {
  vault: VaultDTO;
  feeConfig: InfluenceVaultFeeConfig;
}

const InfluenceVaultFees = ({ vault, feeConfig }: Props): JSX.Element => {
  const classes = useStyles();
  const withdrawFee = getVaultStrategyFee(vault, StrategyFee.withdraw);
  const performanceFee = getVaultStrategyFee(vault, StrategyFee.performance);

  return (
    <Grid container>
      <Typography variant="h6" className={classes.title}>
        Fees
      </Typography>
      <StyledDivider />
      <Grid container direction="column">
        {feeConfig.fees.map((fee, index) => (
          <Grid item container key={index}>
            <InfluenceVaultFee feeConfig={fee} />
          </Grid>
        ))}
        {feeConfig.showFees.includes('withdrawal') && (
          <Grid item container justifyContent="space-between">
            <SpecItem name="Withdrawal Fee" value={formatStrategyFee(withdrawFee)} />
          </Grid>
        )}
        {feeConfig.showFees.includes('performance') && (
          <Grid item container justifyContent="space-between">
            <SpecItem name="Performance Fee" value={formatStrategyFee(performanceFee)} />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default InfluenceVaultFees;
