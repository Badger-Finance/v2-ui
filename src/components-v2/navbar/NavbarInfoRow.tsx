import { Grid, makeStyles } from '@material-ui/core';

import { NavbarSocialContact } from './NavbarSocialContact';
import { NavbarStats } from './NavbarStats';

const useStyles = makeStyles(() => ({
  badgerIconContainer: {
    width: 51,
    height: 28,
    paddingRight: 23,
    cursor: 'pointer',
  },
  badgerIcon: {
    width: '100%',
  },
}));

export const NavbarInfoRow = (): JSX.Element => {
  const classes = useStyles();

  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Grid item container xs={9} md={8} lg={9} alignItems="center">
        <Grid item className={classes.badgerIconContainer} onClick={() => window.open('https://badger.com')}>
          <img
            className={classes.badgerIcon}
            alt="Badger Logo"
            src={'/assets/icons/badger_head.svg'}
            width="28"
            height="28"
          />
        </Grid>
        <Grid item xs>
          <NavbarStats />
        </Grid>
      </Grid>
      <Grid item container xs justifyContent="flex-end">
        <NavbarSocialContact />
      </Grid>
    </Grid>
  );
};
