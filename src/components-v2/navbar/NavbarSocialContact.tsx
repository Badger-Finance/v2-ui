import { Grid, Link, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { Typography } from 'ui-library/Typography';

const useStyles = makeStyles(() => ({
  socialIcon: {
    height: '14px',
    width: '14px',
    cursor: 'pointer',
  },
  iconContainer: {
    display: 'flex',
  },
  twitter: {
    margin: '0px 16px 0px 8px',
  },
}));

export const NavbarSocialContact = (): JSX.Element => {
  const classes = useStyles();
  return (
    <Grid container alignItems="center" justifyContent="flex-end">
      <Grid item className={classes.iconContainer}>
        <img
          onClick={() => window.open('https://discord.gg/badgerdao', '_blank')}
          className={classes.socialIcon}
          alt="Discord Icon"
          src="/assets/icons/discord.svg"
        />
      </Grid>
      <Grid item className={clsx(classes.iconContainer, classes.twitter)}>
        <img
          onClick={() => window.open('https://twitter.com/BadgerDAO', '_blank')}
          className={classes.socialIcon}
          alt="Twitter Icon"
          src="/assets/icons/twitter.svg"
        />
      </Grid>
      <Grid item>
        <Typography variant="helperText">
          <Link color="inherit" href="https://docs.badger.com/" target="_blank" rel="noopener">
            DOCS
          </Link>
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="helperText">
          <Link color="inherit" href="https://forum.badger.finance" target="_blank" rel="noopener">
            FORUM
          </Link>
        </Typography>
      </Grid>
    </Grid>
  );
};
