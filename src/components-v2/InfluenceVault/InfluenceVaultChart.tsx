import { Box, makeStyles, Paper, Typography } from '@material-ui/core';
import { format } from 'd3-format';
import { numberWithCommas } from 'mobx/utils/helpers';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { EmissionRoundToken, InfluenceVaultEmissionRound } from '../../mobx/model/charts/influence-vaults-graph';
import { StyledDivider } from '../vault-detail/styled';

const useStyles = makeStyles(() => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipRoot: {
    padding: 10,
  },
  color1: {
    color: '#F2A52B',
  },
  color2: {
    color: '#A9731E',
  },
  color3: {
    color: '#808080',
  },
  tooltipItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  subItem: {
    fontSize: 9,
    color: '#808080',
  },
}));

interface Props {
  emissions: InfluenceVaultEmissionRound[];
  chartInitialSlice: number;
}

const CustomToolTip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  const classes = useStyles();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const { tokens, vaultTokens, index, start, vaultValue, divisorTokenSymbol } = payload[0].payload;

  const hundredsOfTokens = vaultTokens / 100;
  const totalValue = tokens.reduce((total: number, token: EmissionRoundToken) => (total += token.value), 0);

  // scale a 2 weeks earnings to human readable apr
  // 26 2 week periods scalar + human readable conversion (scale by 100) yields 2600 scalar
  const apr = ((totalValue * (vaultTokens / 100)) / vaultValue) * 2600;

  const colors = [classes.color2, classes.color1, classes.color3];
  return (
    <Box component={Paper} className={classes.tooltipRoot} key={index}>
      <div className={classes.header}>
        <Typography variant="body2">Round {index}</Typography>
        <Typography variant="caption">{new Date(start).toDateString()}</Typography>
      </div>
      <StyledDivider />
      {tokens.map((token: EmissionRoundToken, i: number) => {
        return (
          <div key={`influence-tt-${token.symbol}-${i}`}>
            {token.balance > 0 && (
              <div className={classes.tooltipItem}>
                <Typography variant="body2">
                  {numberWithCommas((token.balance / hundredsOfTokens).toFixed(2))}{' '}
                  <span className={colors[i % 3]}>{token.symbol}</span>
                  <span> per 100 {divisorTokenSymbol}</span>
                </Typography>
                <Typography variant="caption" className={classes.subItem}>
                  ${numberWithCommas(token.value.toFixed())} ({((token.value / totalValue) * 100).toFixed()}%)
                </Typography>
              </div>
            )}
          </div>
        );
      })}
      <Typography variant="caption">
        Value per 100 {divisorTokenSymbol}: ${numberWithCommas(totalValue.toFixed())} (
        {numberWithCommas(apr.toFixed(2))}% APR)
      </Typography>
    </Box>
  );
};

const InfluenceVaultChart = ({ emissions, chartInitialSlice }: Props) => {
  const colors = ['#A9731E', '#F2A52B', '#808080'];
  const allTokens = Array.from(new Set(emissions.flatMap((e) => e.tokens).map((t) => t.symbol)));
  return (
    <ResponsiveContainer width="99%" height={250}>
      {/* Skip Round 1 & 2, it has bad data */}
      <BarChart data={emissions.slice(chartInitialSlice)} margin={{ top: 20, bottom: 0, right: 0, left: 5 }}>
        <CartesianGrid strokeDasharray="4" vertical={false} />
        <XAxis dataKey="index">
          <Label value="Voting Round" position="insideBottomLeft" offset={-10} style={{ fill: 'white' }} />
        </XAxis>
        <YAxis tickFormatter={format('^.2s')}>
          <Label
            value={`$ per 100 ${emissions[0]?.divisorTokenSymbol}`}
            style={{ fill: 'white' }}
            angle={-90}
            position="insideBottomLeft"
          />
        </YAxis>
        <Tooltip content={<CustomToolTip />} cursor={{ fill: '#3a3a3a' }} />
        <Legend />
        {allTokens.map((token, index) => (
          <Bar key={index} name={token} dataKey={`graph.${index}`} stackId="a" fill={colors[index % 3]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default InfluenceVaultChart;
