import React from 'react';
import BigNumber from 'bignumber.js';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid, Typography } from '@material-ui/core';

interface Props {
  calculatedSlippage: BigNumber;
  limitSlippage: number;
}

const useStyles = makeStyles((theme) => ({
  positiveSlippage: {
    color: '#3DDB39',
  },
  positiveSlippageIcon: {
    marginRight: theme.spacing(1),
  },
  negativeSlippage: {
    color: '#FF0101',
  },
}));

const SlippageMessage = ({ calculatedSlippage, limitSlippage }: Props): JSX.Element => {
  const classes = useStyles();

  if (calculatedSlippage.isNegative()) {
    return (
      <Grid container alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <img
            className={classes.positiveSlippageIcon}
            src="/assets/icons/positive-slippage.svg"
            alt="positive slippage icon"
          />
          <Typography variant="body2" className={classes.positiveSlippage}>
            Slippage bonus (incl. pricing)
          </Typography>
        </Box>
        <Typography variant="body2" className={classes.positiveSlippage}>
          {`${calculatedSlippage.absoluteValue().decimalPlaces(4)}%`}
        </Typography>
      </Grid>
    );
  }

  if (calculatedSlippage.isGreaterThan(limitSlippage)) {
    return (
      <Grid container alignItems="center" justifyContent="space-between">
        <Typography variant="body2" className={classes.negativeSlippage}>
          Slippage higher than expected (incl. pricing):
        </Typography>
        <Typography variant="body2" className={classes.negativeSlippage}>
          {`${calculatedSlippage.decimalPlaces(4)}%`}
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Typography variant="body2">Estimated slippage (incl. pricing):</Typography>
      <Typography variant="body2">{`${calculatedSlippage.decimalPlaces(4)}%`}</Typography>
    </Grid>
  );
};

export default SlippageMessage;
