import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BigNumber } from 'ethers';
import React from 'react';

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

const SlippageMessage = ({
  calculatedSlippage,
  limitSlippage,
}: Props): JSX.Element => {
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
          {`${calculatedSlippage.abs().toNumber().toFixed(4)}%`}
        </Typography>
      </Grid>
    );
  }

  if (calculatedSlippage.gt(limitSlippage)) {
    return (
      <Grid container alignItems="center" justifyContent="space-between">
        <Typography variant="body2" className={classes.negativeSlippage}>
          Slippage higher than expected (incl. pricing):
        </Typography>
        <Typography variant="body2" className={classes.negativeSlippage}>
          {`${calculatedSlippage.toNumber().toFixed(4)}%`}
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Typography variant="body2">
        Estimated slippage (incl. pricing):
      </Typography>
      <Typography variant="body2">{`${calculatedSlippage
        .toNumber()
        .toFixed(4)}%`}</Typography>
    </Grid>
  );
};

export default SlippageMessage;
