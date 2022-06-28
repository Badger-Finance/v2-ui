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
}));

interface Props {
	emissions: BveCvxEmissionRound[];
}

const CustomToolTip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
	const classes = useStyles();

	if (!active || !payload || payload.length === 0) {
		return null;
	}

	const { badger, bveCVX, bcvxCrv, vaultTokens, index, start } = payload[0].payload;

	const hundredsOfTokens = vaultTokens / 100;
	const badgerPerHundred = badger / hundredsOfTokens;
	const bveCVXPerHundred = bveCVX / hundredsOfTokens;
	const bcvxCrvPerHundred = bcvxCrv / hundredsOfTokens;

	return (
		<Box component={Paper} className={classes.tooltipRoot}>
			<div className={classes.header}>
				<Typography variant="body2">Round {index}</Typography>
				<Typography variant="caption">{new Date(start * 1000).toDateString()}</Typography>
			</div>
			<StyledDivider />
			{badger > 0 && (
				<Typography variant="body2">
					{numberWithCommas(badgerPerHundred.toFixed(2))} <span className={classes.badgerAmount}>BADGER</span>
					<span> per 100 bveCVX</span>
				</Typography>
			)}
			{bveCVX > 0 && (
				<Typography variant="body2">
					{numberWithCommas(bveCVXPerHundred.toFixed(2))} <span className={classes.bveCVXAmount}>bveCVX</span>
					<span> per 100 bveCVX</span>
				</Typography>
			)}
			{bcvxCrv > 0 && (
				<Typography variant="body2">
					{numberWithCommas(bcvxCrvPerHundred.toFixed(2))}{' '}
					<span className={classes.bcvxCrvAmount}>bcvxCrv</span>
					<span> per 100 bveCVX</span>
				</Typography>
			)}
		</Box>
	);
};

const BveCvxBribeChart = ({ emissions }: Props) => {
	const classes = useStyles();

	return (
		<ResponsiveContainer width="99%" height={250}>
			{/* Fast Forward to Round 8 when we started */}
			<BarChart data={emissions} margin={{ top: 20, bottom: 0, right: 20, left: 0 }}>
				<CartesianGrid strokeDasharray="4" vertical={false} />
				<XAxis dataKey="index" />
				<YAxis tickFormatter={format('^.2s')} />
				<Tooltip content={<CustomToolTip />} cursor={{ fill: '#3a3a3a' }} />
				<Legend height={36} />
				<Bar name="bveCVX" dataKey="bveCVXValue" stackId="a" fill="#A9731E" />
				<Bar name="Badger" dataKey="badgerValue" stackId="a" fill="#F2A52B" />
				<Bar name="bcvxCRV" dataKey="bcvxCrvValue" stackId="a" fill="#808080" />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default BveCvxBribeChart;
