import { VaultDTO } from '@badger-dao/sdk';
import { Divider, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import { StrategyFee } from 'mobx/model/system-config/stategy-fees';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { StrategyFees } from './StrategyFees';

const useStyles = makeStyles((theme) => ({
  specName: {
    fontSize: 12,
    lineHeight: '1.66',
  },
  divider: {
    width: '100%',
    marginBottom: theme.spacing(1),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  help: {
    width: 12,
    height: 12,
  },
  helpIcon: {
    fontSize: 16,
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

function getVaultStrategyFee(vault: VaultDTO, fee: StrategyFee): number {
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
  vault: VaultDTO;
  onHelpClick?: () => void;
}

export const VaultFees = observer(({ vault, onHelpClick, ...rootProps }: Props): JSX.Element | null => {
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
        <Typography>Fees</Typography>
        <Divider className={classes.divider} />
        <Typography className={classes.specName} color="textSecondary" display="inline">
          There are no fees for this vault
        </Typography>
      </div>
    );
  }

  return (
    <div {...rootProps}>
      <div className={classes.titleContainer}>
        <Typography>Fees</Typography>
        {onHelpClick && (
          <Tooltip enterTouchDelay={0} color="primary" arrow placement="top" title="Click to see full description">
            <HelpIcon className={classes.helpIcon} onClick={onHelpClick} aria-label="see fees descriptions" />
          </Tooltip>
        )}
      </div>
      <Divider className={classes.divider} />
      <StrategyFees vault={vault} />
    </div>
  );
});
