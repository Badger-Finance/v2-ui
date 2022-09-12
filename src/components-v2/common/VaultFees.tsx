import { VaultDTOV3 } from '@badger-dao/sdk';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ethers } from 'ethers';
import { StrategyFee } from 'mobx/model/system-config/stategy-fees';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { StrategyFees } from './StrategyFees';

const useStyles = makeStyles(() => ({
  specName: {
    fontSize: 12,
    lineHeight: '1.66',
  },
  help: {
    width: 12,
    height: 12,
  },
}));

function getVaultStrategyFee(vault: VaultDTOV3, fee: StrategyFee): number {
  const { strategy } = vault;
  if (strategy.address === ethers.constants.AddressZero) {
    return 0;
  }
  switch (fee) {
    case StrategyFee.withdraw:
      return strategy.withdrawFee;
    case StrategyFee.performance:
      return strategy.performanceFee;
    case StrategyFee.strategistPerformance:
      return strategy.strategistFee;
    case StrategyFee.aumFee:
      return strategy.aumFee;
    default:
      return 0;
  }
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  vault: VaultDTOV3;
  onHelpClick?: () => void;
  includeDisclaimer: boolean;
}

export const VaultFees = observer(
  ({ vault, onHelpClick, includeDisclaimer, ...rootProps }: Props): JSX.Element | null => {
    const classes = useStyles();

    let totalFees = 0;
    for (const fee of Object.values(StrategyFee)) {
      const feesAmount = getVaultStrategyFee(vault, fee);
      if (feesAmount && feesAmount > 0) {
        totalFees++;
      }
    }

    if (totalFees === 0) {
      return (
        <div {...rootProps}>
          <Typography className={classes.specName} color="textSecondary" display="inline">
            There are no fees for this vault
          </Typography>
        </div>
      );
    }

    return (
      <div {...rootProps}>
        <StrategyFees vault={vault} onHelpClick={onHelpClick} />
        {includeDisclaimer && (
          <Typography className={classes.specName} color="textSecondary">
            Fees are not included in APY estimates
          </Typography>
        )}
      </div>
    );
  },
);
