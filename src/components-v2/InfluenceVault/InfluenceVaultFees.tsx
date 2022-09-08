import { VaultDTOV3 } from '@badger-dao/sdk';
import { Grid } from '@material-ui/core';
import { InfluenceVaultFeeConfig } from 'mobx/model/vaults/influence-vault-data';
import React from 'react';

import { StrategyFee } from '../../mobx/model/system-config/stategy-fees';
import { getVaultStrategyFee } from '../../mobx/utils/fees';
import { formatStrategyFee } from '../../utils/componentHelpers';
import SpecItem from '../vault-detail/specs/SpecItem';
import InfluenceVaultFee from './InfluenceVaultFee';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  vault: VaultDTOV3;
  feeConfig: InfluenceVaultFeeConfig;
}

const InfluenceVaultFees = ({ vault, feeConfig, ...rootProps }: Props): JSX.Element => {
  const withdrawFee = getVaultStrategyFee(vault, StrategyFee.withdraw);
  const performanceFee = getVaultStrategyFee(vault, StrategyFee.performance);

  return (
    <div {...rootProps}>
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
    </div>
  );
};

export default InfluenceVaultFees;
