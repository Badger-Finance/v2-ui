import React from 'react';
import BigNumber from 'bignumber.js';
import { Grid, makeStyles, Tooltip } from '@material-ui/core';

import { ErrorText } from './Common';
import { MintLimits } from '../../mobx/model/strategies/mint-limits';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';

interface Props {
  token: TokenBalance;
  amount: BigNumber;
  limits: MintLimits;
  onUserLimitClick: (limit: BigNumber) => void;
}

const useStyles = makeStyles(() => ({
  userLimit: {
    cursor: 'pointer',
  },
}));

export const MintError = ({ token, amount, limits, onUserLimitClick }: Props): JSX.Element | null => {
  const classes = useStyles();
  const { userLimit, individualLimit, globalLimit, allUsersLimit } = limits;

  const UserLimit = () => (
    <Grid container>
      <ErrorText variant="subtitle1">
        <span>{`Your current mint amount limit is `}</span>
        <Tooltip
          enterTouchDelay={0}
          arrow
          className={classes.userLimit}
          title="Apply amount"
          placement="top"
          onClick={() => onUserLimitClick(userLimit)}
        >
          <span>{`${token.balanceDisplay(6)} `}</span>
        </Tooltip>
        <span>{`${token.token.symbol}.`}</span>
      </ErrorText>
      <ErrorText variant="subtitle1">
        {`Individual total mint amount limit is currently ${TokenBalance.fromBigNumber(
          token,
          individualLimit,
        ).balanceDisplay(6)} ${token.token.symbol}.`}
      </ErrorText>
    </Grid>
  );

  const GlobalLimit = () => (
    <Grid container>
      <ErrorText variant="subtitle1">
        <span>{`The current global mint amount limit is `}</span>
        <Tooltip
          enterTouchDelay={0}
          arrow
          className={classes.userLimit}
          title="Apply amount"
          placement="top"
          onClick={() => onUserLimitClick(allUsersLimit)}
        >
          <span>{`${TokenBalance.fromBigNumber(token, allUsersLimit).balanceDisplay(6)}`}</span>
        </Tooltip>
        <span> {token.token.symbol}.</span>
      </ErrorText>
      <ErrorText variant="subtitle1">
        {`Global total mint amount is currently ${TokenBalance.fromBigNumber(token, globalLimit).balanceDisplay(6)} ${
          token.token.symbol
        }.`}
      </ErrorText>
    </Grid>
  );

  if (amount.gt(userLimit)) {
    return userLimit.lt(allUsersLimit) ? <UserLimit /> : <GlobalLimit />;
  }

  if (amount.gt(allUsersLimit)) return <GlobalLimit />;

  return null;
};
