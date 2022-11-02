import { Grid, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BookOutlinedIcon from '@material-ui/icons/BookOutlined';
import Alert from '@material-ui/lab/Alert';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { LayoutContainer, PageHeaderContainer } from '../../components-v2/common/Containers';
import PageHeader from '../../components-v2/common/PageHeader';
import { Optimizer } from './Optimizer';

const useStyles = makeStyles((theme) => ({
  boostLink: {
    fontWeight: 800,
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  userGuide: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
    width: '100%',
  },
  userGuideIcon: {
    color: theme.palette.primary.main,
  },
  userGuideLink: {
    marginLeft: 3,
  },
}));

const BoostOptimizer = observer(() => {
  const classes = useStyles();

  return (
    <LayoutContainer>
      <Grid container spacing={1} justifyContent="center">
        <PageHeaderContainer item xs={12}>
          <PageHeader
            title="Badger Boost Optimizer"
            subtitle="Determine deposits needed in order to hit your desired boost ratio."
          />
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://medium.com/badgerdao/badger-boost-power-up-stake-ratio-levels-e0c9802fc5c3"
            color="primary"
            className={classes.boostLink}
          >
            How does boost work?
          </Link>
        </PageHeaderContainer>
        <Grid item xs={12}>
          <Optimizer />
        </Grid>
        <Alert
          className={classes.userGuide}
          severity="info"
          iconMapping={{
            info: <BookOutlinedIcon fontSize="inherit" className={classes.userGuideIcon} />,
          }}
        >
          Not sure where to start? Check out the
          <Link
            href="https://docs.badger.com/badger-boost/badger-boost"
            rel="noreferrer"
            target="_blank"
            className={classes.userGuideLink}
          >
            Boost Optimizer User Guide
          </Link>
        </Alert>
      </Grid>
    </LayoutContainer>
  );
});

export default BoostOptimizer;
