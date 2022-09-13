import { ChartTimeFrame, VaultDTO, VaultSnapshot, VaultVersion } from '@badger-dao/sdk';
import { isInfluenceVault } from 'components-v2/InfluenceVault/InfluenceVaultUtil';
import { FLAGS } from 'config/environment';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import React, { useState } from 'react';
import { Area, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  chartData: VaultSnapshot[];
  vault: VaultDTO;
  timeframe: ChartTimeFrame;
}

const valueFormatter = format('^$.3s');
const balanceFormatter = format('^.3s');

function legendFormatter(value: string): string {
  switch (value) {
    case 'value':
      return 'TVL';
    case 'balance':
      return 'Vault Balance';
    case 'yieldApr':
      return 'Spot APR';
    case 'harvestApr':
      return 'Current APR';
    default:
      return FLAGS.APY_EVOLUTION ? 'Gross APR' : 'Historic APR';
  }
}

function getTimeFormatter(timeframe: ChartTimeFrame) {
  switch (timeframe) {
    case ChartTimeFrame.Day:
      return timeFormat('%I %p');
    case ChartTimeFrame.Week:
      return timeFormat('%a %d');
    case ChartTimeFrame.Month:
    case ChartTimeFrame.ThreeMonth:
    case ChartTimeFrame.Year:
    case ChartTimeFrame.YTD:
      return timeFormat('%b %d');
    default:
      return timeFormat('%B');
  }
}

function tooltipFormatter(value: number, name: string): [string, string] {
  switch (name) {
    case 'value':
      return [valueFormatter(value), 'TVL'];
    case 'balance':
      return [balanceFormatter(value), 'Vault Balance'];
    case 'yieldApr':
      return [`${value.toFixed(2)}%`, 'Spot'];
    case 'harvestApr':
      return [`${value.toFixed(2)}%`, 'Current APR'];
    default:
      return [`${value.toFixed(2)}%`, FLAGS.APY_EVOLUTION ? 'Gross APR' : 'APR'];
  }
}

enum ChartValueType {
  USD,
  Balance,
}

export const VaultChart = (props: Props): JSX.Element | null => {
  const { timeframe, chartData, vault } = props;
  /* eslint-disable unused-imports/no-unused-vars */
  const [valueType, setValueType] = useState(ChartValueType.USD);

  if (chartData.length === 0) {
    return null;
  }

  const { version } = vault;

  let minYield = Number.MAX_VALUE;
  let maxYield = Number.MIN_VALUE;

  chartData.forEach((d) => {
    if (d.apr < minYield) {
      minYield = d.apr;
    }
    if (d.apr > maxYield) {
      maxYield = d.apr;
    }
    if (!isInfluenceVault(vault.vaultToken) && version === VaultVersion.v1_5) {
      if (d.yieldApr < minYield) {
        minYield = d.yieldApr;
      }
      if (d.harvestApr < minYield) {
        minYield = d.harvestApr;
      }
      if (d.yieldApr > maxYield) {
        maxYield = d.yieldApr;
      }
      if (d.harvestApr > maxYield) {
        maxYield = d.harvestApr;
      }
    }
  });

  return (
    <ResponsiveContainer width={'99%'}>
      <ComposedChart data={chartData}>
        <Legend formatter={legendFormatter} />
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={getTimeFormatter(timeframe)}
          contentStyle={{
            background: '#262626',
            borderRadius: '10px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        />
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={getTimeFormatter(timeframe)}
          style={{ fill: 'white' }}
          tickCount={10}
        />
        {valueType === ChartValueType.USD && (
          <YAxis
            dataKey="value"
            yAxisId="value"
            type="number"
            domain={[0, 'auto']}
            tickCount={10}
            minTickGap={50}
            tickFormatter={valueFormatter}
            style={{ fill: 'white' }}
          />
        )}
        {valueType === ChartValueType.Balance && (
          <YAxis
            dataKey="balance"
            yAxisId="balance"
            type="number"
            domain={['auto', 'auto']}
            tickCount={10}
            minTickGap={50}
            tickFormatter={balanceFormatter}
            style={{ fill: 'white' }}
          />
        )}
        <YAxis
          dataKey={`${FLAGS.APY_EVOLUTION ? 'grossApr' : 'apr'}`}
          yAxisId={`${FLAGS.APY_EVOLUTION ? 'gross-apr' : 'apr'}`}
          orientation="right"
          type="number"
          domain={[0, maxYield * 1.05]}
          tickCount={10}
          minTickGap={50}
          tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          style={{ fill: 'white' }}
        />
        {valueType === ChartValueType.USD && (
          <Area
            type="monotone"
            dataKey="value"
            fill="rgba(29, 114, 255, 0.1)"
            stroke="#1D72FF"
            yAxisId="value"
            strokeWidth={2}
          />
        )}
        {valueType === ChartValueType.Balance && (
          <Area
            type="monotone"
            dataKey="balance"
            fill="rgba(29, 114, 255, 0.1)"
            stroke="#1D72FF"
            yAxisId="balance"
            strokeWidth={2}
          />
        )}
        <Line
          type="monotone"
          dataKey={`${FLAGS.APY_EVOLUTION ? 'grossApr' : 'apr'}`}
          fill="#E2652B"
          stroke="#E2652B"
          yAxisId={`${FLAGS.APY_EVOLUTION ? 'gross-apr' : 'apr'}`}
          strokeWidth={1.5}
          dot={false}
        />
        {version === VaultVersion.v1_5 && !isInfluenceVault(vault.vaultToken) && (
          <Line
            type="monotone"
            dataKey="harvestApr"
            fill="#3bba9c"
            stroke="#3bba9c"
            yAxisId={`${FLAGS.APY_EVOLUTION ? 'gross-apr' : 'apr'}`}
            strokeWidth={1.5}
            dot={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
