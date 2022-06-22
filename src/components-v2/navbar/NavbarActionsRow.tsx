import { Grid } from '@material-ui/core';
import React from 'react';

import { NavbarButtons } from './NavbarButtons';
import { NavbarTabs } from './NavbarTabs';

export const NavbarActionsRow = (): JSX.Element => {
  return (
    <Grid container>
      <Grid item xs="auto">
        <NavbarTabs />
      </Grid>
      <Grid item container xs>
        <NavbarButtons />
      </Grid>
    </Grid>
  );
};
