import React from 'react';
import { Grid, Button } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

import { ValuesProp } from './Common';

interface SuccessFormProps {
  values: ValuesProp;
  classes: ClassNameMap;
  updateState: (name: string, value: unknown) => void;
  resetState: () => void;
}

export const SuccessForm = (props: SuccessFormProps): JSX.Element => {
  const { classes, resetState, values } = props;

  const gotoStart = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    resetState();
  };

  return (
    <Grid container alignItems={'center'}>
      <Grid item xs={12}>
        <div>{values.tabValue <= 1 ? 'Minting' : 'Releasing'} was successful!</div>
      </Grid>
      {values.spacer}
      {values.spacer}
      <Grid container justifyContent={'center'}>
        <Button variant="contained" color="primary" className={classes.button} onClick={gotoStart}>
          Back to start
        </Button>
      </Grid>
    </Grid>
  );
};
