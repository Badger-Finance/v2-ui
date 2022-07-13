import { VaultDTO } from '@badger-dao/sdk';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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
    fontSize: 12,
    marginTop: 5,
  },
});

interface Props {
  vault: VaultDTO;
  boost: number;
  isDisabled?: boolean;
  projectedBoost: number | null;
}

const VaultItemApr = ({ vault, boost, projectedBoost }: Props): JSX.Element => {
  const classes = useStyles();
  const [showApyInfo, setShowApyInfo] = useState(false);

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

  return (
    <Box
      display="flex"
      alignItems="flex-start"
      flexDirection="column"
      onClick={handleApyInfoClick}
      className={classes.root}
    >
      <Box display="flex">
        <Typography variant="body1" color={'textPrimary'} display="inline">
          {`${numberWithCommas(boost.toFixed(2))}%`}
        </Typography>
        <img src="/assets/icons/apy-info.svg" className={classes.apyInfo} alt="apy info icon" />
      </Box>
      {projectedBoost !== null && (
        <Box display="flex">
          <Typography className={classes.projectedApr}>
            Proj. {`${numberWithCommas(projectedBoost.toFixed(2))}%`}
          </Typography>
        </Box>
      )}
      <VaultApyInformation
        open={showApyInfo}
        vault={vault}
        boost={boost}
        projectedBoost={projectedBoost}
        onClose={handleClose}
      />
    </Box>
  );
};

export default VaultItemApr;
