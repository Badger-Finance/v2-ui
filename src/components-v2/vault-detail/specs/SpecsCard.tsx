import { VaultDTOV3 } from '@badger-dao/sdk';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { CardContainer } from '../styled';
import { Claims } from './Claims';
import { Fees } from './Fees';
import { Tokens } from './Tokens';
import VaultDetailLinks from './VaultDetailLinks';
import VaultMetrics from './VaultMetrics';

const useStyles = makeStyles((theme) => ({
  root: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    display: 'flex',
  },
  specSection: {
    marginBottom: 20,
  },
}));

interface Props {
  vault: VaultDTOV3;
}

const SpecsCard = ({ vault }: Props): JSX.Element => {
  const classes = useStyles();

  return (
    <CardContainer className={classes.root}>
      <Grid item xs className={classes.specSection}>
        <VaultMetrics vault={vault} />
      </Grid>
      <Grid item xs className={classes.specSection}>
        <Tokens vault={vault} />
      </Grid>
      <Grid item xs className={classes.specSection}>
        <Claims />
      </Grid>
      <Grid item xs className={classes.specSection}>
        <Fees vault={vault} />
      </Grid>
      <Grid item xs>
        <VaultDetailLinks vault={vault} />
      </Grid>
    </CardContainer>
  );
};

export default SpecsCard;
