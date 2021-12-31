import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Loader } from '../../../components/Loader';
import { makeStyles } from '@material-ui/core/styles';
import ErrorIcon from '@material-ui/icons/Error';
import { ChartDataPoint } from 'mobx/model/charts/chart-data-point';

const useStyles = makeStyles((theme) => ({
  errorMessage: {
    marginTop: theme.spacing(1),
  },
  errorIcon: {
    fontSize: 60,
  },
}));

interface Props {
  data: ChartDataPoint[] | null;
  loading?: boolean;
  children: React.ReactNode;
}

const ChartContent = ({ data, loading = true, children }: Props): JSX.Element => {
  const classes = useStyles();

  if (loading) {
    return <Loader message="Loading chart information" />;
  }

  if (!data) {
    return (
      <Grid container direction="column" justifyContent="center" alignItems="center">
        <ErrorIcon className={classes.errorIcon} />
        <Typography variant="body1" className={classes.errorMessage}>
          Something went wrong, please refresh the page.
        </Typography>
      </Grid>
    );
  }

  if (data.length <= 1) {
    return (
      <Grid container direction="column" justifyContent="center" alignItems="center">
        <ErrorIcon className={classes.errorIcon} />
        <Typography variant="body1" className={classes.errorMessage}>
          Chart data not available. Try again shortly.
        </Typography>
      </Grid>
    );
  }

  return <>{children}</>;
};

export default ChartContent;
