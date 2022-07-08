import { Box, ButtonBase, Divider, Grid, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { Fragment, useEffect, useState } from 'react';

import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { useNumericInput } from '../../utils/useNumericInput';

interface Props {
  tokenBalance: TokenBalance;
  onChange: (balance: TokenBalance) => void;
}

const useStyles = makeStyles((theme) => ({
  percentagesContainer: {
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'flex-end',
    },
  },
  input: {
    textAlign: 'end',
  },
  balances: {
    marginTop: theme.spacing(1),
  },
  percentageButton: {
    padding: '0px 16px',
  },
  divider: {
    margin: 0,
  },
}));

const BalanceInput = ({ tokenBalance, onChange }: Props): JSX.Element => {
  const { balance, price, token } = tokenBalance;
  const [inputValue, setInputValue] = useState(balance.toString());
  const { inputProps, onValidChange } = useNumericInput({
    fontSize: '12px',
    padding: '14px',
  });
  const classes = useStyles();

  const handleInputChange = (amount: string) => {
    setInputValue(amount);
    const input = Number(amount);
    const value = isNaN(input) ? input : 0;
    const inputBalance = TokenBalance.fromBalance(tokenBalance, value);
    onChange(inputBalance);
  };

  const handleApplyPercentage = (percentage: number) => {
    setInputValue(((balance * percentage) / 100).toString());
    onChange(new TokenBalance(token, tokenBalance.tokenBalance.mul(percentage).div(100), price));
  };

  const percentages = (
    <Box className={classes.percentagesContainer}>
      {[25, 50, 75, 100].map((percentage, index, total) => (
        <Fragment key={`${percentage}%_${index}`}>
          <ButtonBase
            focusRipple
            className={classes.percentageButton}
            onClick={() => handleApplyPercentage(percentage)}
          >
            <Typography variant="caption">{`${percentage}%`}</Typography>
          </ButtonBase>
          {index !== total.length - 1 && (
            <Divider className={classes.divider} orientation="vertical" variant="middle" flexItem />
          )}
        </Fragment>
      ))}
    </Box>
  );

  useEffect(() => {
    setInputValue(tokenBalance.balance.toString());
  }, [tokenBalance]);

  return (
    <Grid container>
      <Grid item xs={12} sm={3}>
        <Typography variant="subtitle2">{token.symbol}</Typography>
        <Typography variant="caption" color="textSecondary">
          {price.toFixed(2)}
        </Typography>
      </Grid>
      <Grid item container xs={12} sm={9}>
        <Box width="100%">
          <TextField
            fullWidth
            inputProps={inputProps}
            className={classes.input}
            variant="outlined"
            value={inputValue}
            onChange={onValidChange(handleInputChange)}
          />
        </Box>
        <Grid container alignItems="center" justifyContent="space-between" className={classes.balances}>
          <Box>
            <Typography variant="caption">{`BALANCE: ${tokenBalance.balanceDisplay(6)}`}</Typography>
          </Box>
          {percentages}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default BalanceInput;
