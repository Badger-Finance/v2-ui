import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BadgerSett } from '../../../mobx/model/vaults/badger-sett';
import { Tokens } from './Tokens';
import { Claims } from './Claims';
import SettDetailLinks from './SettDetailLinks';
import { Fees } from './Fees';
import { CardContainer } from '../styled';
import SettMetrics from './SettMetrics';
import { Vault } from '@badger-dao/sdk';

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
  sett: Vault;
  badgerSett: BadgerSett;
}

const SpecsCard = ({ sett, badgerSett }: Props): JSX.Element => {
  const classes = useStyles();

  return (
    <CardContainer className={classes.root}>
      <Grid item xs className={classes.specSection}>
        <SettMetrics sett={sett} />
      </Grid>
      <Grid item xs className={classes.specSection}>
        <Tokens sett={sett} />
      </Grid>
      <Grid item xs className={classes.specSection}>
        <Claims />
      </Grid>
      <Grid item xs className={classes.specSection}>
        <Fees sett={sett} />
      </Grid>
      <Grid item xs>
        <SettDetailLinks sett={sett} badgerSett={badgerSett} />
      </Grid>
    </CardContainer>
  );
};

export default SpecsCard;
