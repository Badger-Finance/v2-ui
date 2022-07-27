import { Grid, makeStyles, Typography } from '@material-ui/core';
import { FeeConfig } from 'mobx/model/vaults/influence-vault-data';
import React, { useState } from 'react';

import SpecItem from '../vault-detail/specs/SpecItem';
import { StyledHelpIcon } from '../vault-detail/styled';
import InfluenceVaultModal from './InfluenceVaultModal';

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
  feeConfig: FeeConfig;
}

const InfluenceVaultFee = ({ feeConfig }: Props): JSX.Element => {
  const classes = useStyles();
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  return (
    <Grid container>
      {feeConfig.value ? (
        <Grid item container justifyContent="space-between">
          <Typography display="inline" color="textSecondary" className={classes.spec}>
            {feeConfig.feeModalConfig.title}
            <StyledHelpIcon onClick={() => setInfoDialogOpen(true)} />
          </Typography>
          <Typography variant="subtitle2" display="inline" className={classes.spec}>
            {feeConfig.value}
          </Typography>
        </Grid>
      ) : (
        <Typography display="inline" color="textSecondary" className={classes.spec}>
          {feeConfig.feeModalConfig.title}
          <StyledHelpIcon onClick={() => setInfoDialogOpen(true)} />
        </Typography>
      )}
      <Grid container direction="column">
        {feeConfig.subFees.map((fee, index) => (
          <SpecItem key={index} className={classes.subSpec} name={fee[0]} value={fee[1]} />
        ))}
      </Grid>
      <InfluenceVaultModal
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        config={feeConfig.feeModalConfig}
      />
    </Grid>
  );
};

export default InfluenceVaultFee;
