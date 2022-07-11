import React from 'react';
import {
	BarChart,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	Bar,
	ResponsiveContainer,
	TooltipProps,
	Label,
} from 'recharts';
import { format } from 'd3-format';
import { Box, makeStyles, Typography, Paper } from '@material-ui/core';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { StyledDivider } from '../vault-detail/styled';
import { InfluenceVaultEmissionRound, EmissionRoundToken } from '../../mobx/model/charts/bve-cvx-emission-round';
import { numberWithCommas } from 'mobx/utils/helpers';

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
}

const CustomToolTip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
	const classes = useStyles();

	if (!active || !payload || payload.length === 0) {
		return null;
	}

	const { tokens, vaultTokens, index, start, vaultValue, diviserTokenSymbol } = payload[0].payload;

	const hundredsOfTokens = vaultTokens / 100;
	const totalValue = tokens.reduce((total: number, token: EmissionRoundToken) => (total += token.value), 0);

	// scale a 2 weeks earnings to human readable apr
	// 26 2 week periods scalar + human readable conversion (scale by 100) yields 2600 scalar
	const apr = ((totalValue * (vaultTokens / 100)) / vaultValue) * 2600;

	const colors = [classes.color2, classes.color1, classes.color3];

	return (
		<Box component={Paper} className={classes.tooltipRoot}>
			<div className={classes.header}>
				<Typography variant="body2">Round {index}</Typography>
				<Typography variant="caption">{new Date(start * 1000).toDateString()}</Typography>
			</div>
			<StyledDivider />
			{tokens.map((token: EmissionRoundToken, index: number) => {
				return (
					<>
						{token.balance > 0 && (
							<div className={classes.tooltipItem} key={index}>
								<Typography variant="body2">
									{numberWithCommas((token.balance / hundredsOfTokens).toFixed(2))}{' '}
									<span className={colors[index % 3]}>{token.symbol}</span>
									<span> per 100 {diviserTokenSymbol}</span>
								</Typography>
								<Typography variant="caption" className={classes.subItem}>
									${numberWithCommas(token.value.toFixed())} (
									{((token.value / totalValue) * 100).toFixed()}%)
								</Typography>
							</div>
						)}
					</>
				);
			})}
			<Typography variant="caption">
				Value per 100 {diviserTokenSymbol}: ${numberWithCommas(totalValue.toFixed())} (
				{numberWithCommas(apr.toFixed(2))}% APR)
			</Typography>
		</Box>
	);
};

const InfluenceVaultChart = ({ emissions }: Props) => {
	return (
		<ResponsiveContainer width="99%" height={250}>
			{/* Skip Round 1 & 2, it has bad data */}
			<BarChart data={emissions.slice(2)} margin={{ top: 20, bottom: 0, right: 0, left: 5 }}>
				<CartesianGrid strokeDasharray="4" vertical={false} />
				<XAxis dataKey="index">
					<Label value="Voting Round" position="insideBottomLeft" offset={-10} style={{ fill: 'white' }} />
				</XAxis>
				<YAxis tickFormatter={format('^.2s')}>
					<Label
						value={`$ per 100 ${emissions[0]?.diviserTokenSymbol}`}
						style={{ fill: 'white' }}
						angle={-90}
						position="insideBottomLeft"
					/>
				</YAxis>
				<Tooltip content={<CustomToolTip />} cursor={{ fill: '#3a3a3a' }} />
				<Legend />
				<Bar name={emissions[0].tokens[0].symbol} dataKey="graph.value1" stackId="a" fill="#A9731E" />
				<Bar name={emissions[0].tokens[1].symbol} dataKey="graph.value2" stackId="a" fill="#F2A52B" />
				<Bar name={emissions[0].tokens[2].symbol} dataKey="graph.value3" stackId="a" fill="#808080" />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default InfluenceVaultChart;
