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
import { BveCvxEmissionRound } from '../../mobx/model/charts/bve-cvx-emission-round';
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
	badgerAmount: {
		color: '#F2A52B',
	},
	bveCVXAmount: {
		color: '#A9731E',
	},
	bcvxCrvAmount: {
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
	emissions: BveCvxEmissionRound[];
}

const CustomToolTip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
	const classes = useStyles();

	if (!active || !payload || payload.length === 0) {
		return null;
	}

	const { badger, badgerValue, bveCVX, bveCVXValue, bcvxCrv, bcvxCrvValue, vaultTokens, index, start, vaultValue } =
		payload[0].payload;

	const totalValue = badgerValue + bveCVXValue + bcvxCrvValue;
	const hundredsOfTokens = vaultTokens / 100;
	const badgerPerHundred = badger / hundredsOfTokens;
	const badgerBreakdown = (badgerValue / totalValue) * 100;
	const bveCVXPerHundred = bveCVX / hundredsOfTokens;
	const bveCVXBreakdown = (bveCVXValue / totalValue) * 100;
	const bcvxCrvPerHundred = bcvxCrv / hundredsOfTokens;
	const bcvxCrvBreakdown = (bcvxCrvValue / totalValue) * 100;
	// scale a 2 weeks earnings to human readable apr
	// 26 2 week periods scalar + human readable conversion (scale by 100) yields 2600 scalar
	const apr = ((totalValue * (vaultTokens / 100)) / vaultValue) * 2600;

	return (
		<Box component={Paper} className={classes.tooltipRoot}>
			<div className={classes.header}>
				<Typography variant="body2">Round {index}</Typography>
				<Typography variant="caption">{new Date(start * 1000).toDateString()}</Typography>
			</div>
			<StyledDivider />
			{badger > 0 && (
				<div className={classes.tooltipItem}>
					<Typography variant="body2">
						{numberWithCommas(badgerPerHundred.toFixed(2))}{' '}
						<span className={classes.badgerAmount}>BADGER</span>
						<span> per 100 bveCVX</span>
					</Typography>
					<Typography variant="caption" className={classes.subItem}>
						${numberWithCommas(badgerValue.toFixed())} ({badgerBreakdown.toFixed()}%)
					</Typography>
				</div>
			)}
			{bveCVX > 0 && (
				<div className={classes.tooltipItem}>
					<Typography variant="body2">
						{numberWithCommas(bveCVXPerHundred.toFixed(2))}{' '}
						<span className={classes.bveCVXAmount}>bveCVX</span>
						<span> per 100 bveCVX</span>
					</Typography>
					<Typography variant="caption" className={classes.subItem}>
						${numberWithCommas(bveCVXValue.toFixed())} ({bveCVXBreakdown.toFixed()}%)
					</Typography>
				</div>
			)}
			{bcvxCrv > 0 && (
				<div className={classes.tooltipItem}>
					<Typography variant="body2">
						{numberWithCommas(bcvxCrvPerHundred.toFixed(2))}{' '}
						<span className={classes.bcvxCrvAmount}>bcvxCrv</span>
						<span> per 100 bveCVX</span>
					</Typography>
					<Typography variant="caption" className={classes.subItem}>
						${numberWithCommas(bcvxCrvValue.toFixed())} ({bcvxCrvBreakdown.toFixed()}%)
					</Typography>
				</div>
			)}
			<Typography variant="caption">
				Value per 100 bveCVX: ${numberWithCommas(totalValue.toFixed())} ({numberWithCommas(apr.toFixed(2))}%
				APR)
			</Typography>
		</Box>
	);
};

const BveCvxBribeChart = ({ emissions }: Props) => {
	return (
		<ResponsiveContainer width="99%" height={250}>
			{/* Skip Round 1 & 2, it has bad data */}
			<BarChart data={emissions.slice(2)} margin={{ top: 20, bottom: 0, right: 0, left: 5 }}>
				<CartesianGrid strokeDasharray="4" vertical={false} />
				<XAxis dataKey="index">
					<Label value="Voting Round" position="insideBottomLeft" offset={-10} style={{ fill: 'white' }} />
				</XAxis>
				<YAxis tickFormatter={format('^.2s')}>
					<Label value="$ per 100 bveCVX" style={{ fill: 'white' }} angle={-90} position="insideBottomLeft" />
				</YAxis>
				<Tooltip content={<CustomToolTip />} cursor={{ fill: '#3a3a3a' }} />
				<Legend />
				<Bar name="bveCVX" dataKey="bveCVXValue" stackId="a" fill="#A9731E" />
				<Bar name="Badger" dataKey="badgerValue" stackId="a" fill="#F2A52B" />
				<Bar name="bcvxCRV" dataKey="bcvxCrvValue" stackId="a" fill="#808080" />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default BveCvxBribeChart;
