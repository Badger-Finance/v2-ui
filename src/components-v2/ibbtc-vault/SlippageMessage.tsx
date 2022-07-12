import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BigNumber, utils } from 'ethers';
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

const SlippageMessage = ({ calculatedSlippage, limitSlippage }: Props): JSX.Element | null => {
  const classes = useStyles();

  const formattedSlippage = `${Math.abs(Number(utils.formatEther(calculatedSlippage))).toFixed(4)}%`;

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
          {formattedSlippage}
        </Typography>
      </Grid>
    );
  }

  if (calculatedSlippage.gt(utils.parseEther(limitSlippage.toString()))) {
    return (
      <Grid container alignItems="center" justifyContent="space-between">
        <Typography variant="body2" className={classes.negativeSlippage}>
          Slippage higher than expected (incl. pricing):
        </Typography>
        <Typography variant="body2" className={classes.negativeSlippage}>
          {formattedSlippage}
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Typography variant="body2">Estimated slippage (incl. pricing):</Typography>
      <Typography variant="body2">{formattedSlippage}</Typography>
    </Grid>
  );
};

export default SlippageMessage;
