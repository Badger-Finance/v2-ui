import { VaultDTO } from '@badger-dao/sdk';
import { Box, Grid, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import { getVaultStrategyFee } from 'mobx/utils/fees';
import React from 'react';

import { StrategyFee, userReadableFeeNames } from '../../mobx/model/system-config/stategy-fees';
import { formatStrategyFee } from '../../utils/componentHelpers';

const useStyles = makeStyles((theme) => ({
  specName: {
    fontSize: 14,
    lineHeight: '1.66',
  },
  helpIcon: {
    fontSize: 16,
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  feeRow: {
    marginBottom: theme.spacing(1),
  },
}));

interface Props {
  vault: VaultDTO;
  showEmpty?: boolean;
  onHelpClick?: () => void;
}

export const StrategyFees = ({ vault, onHelpClick, showEmpty = false }: Props): JSX.Element => {
  const classes = useStyles();
  const feeKeys = Object.values(StrategyFee);

  const feeItems = feeKeys.map((key) => {
    const fee = getVaultStrategyFee(vault, key);
    if (!fee) {
      return null;
    }

    if (fee === 0 && !showEmpty) {
      return null;
    }

    return (
      <Grid key={key} container justifyContent="space-between" className={classes.feeRow}>
        <Box display="flex" alignItems="center">
          <Typography className={classes.specName} color="textSecondary" component="span">
            {userReadableFeeNames[key]}{' '}
          </Typography>
          {onHelpClick && (
            <Tooltip enterTouchDelay={0} color="primary" arrow placement="top" title="Click to see full description">
              <HelpIcon className={classes.helpIcon} onClick={onHelpClick} aria-label="see fees descriptions" />
            </Tooltip>
          )}
        </Box>
        <Typography display="inline" variant="subtitle2">
          {formatStrategyFee(fee)}
        </Typography>
      </Grid>
    );
  });

  return <Grid container>{feeItems}</Grid>;
};
