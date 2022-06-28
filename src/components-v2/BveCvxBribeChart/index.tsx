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

const useStyles = makeStyles(() => ({
	root: {
		background: '#181818',
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
}));

interface Props {
	emissions: BveCvxEmissionRound[];
}

const CustomToolTip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
	const classes = useStyles();

	if (!active || !payload || payload.length === 0) {
		return null;
	}

	const { badger, bveCVX, bcvxCrv, index } = payload[0].payload;

	return (
		<Box component={Paper} className={classes.tooltipRoot}>
			<Typography variant="body2">Round {index}</Typography>
			<StyledDivider />
			<Typography variant="body2">
				{Number(badger.toFixed(2))} <span className={classes.badgerAmount}>BADGER</span>
			</Typography>
			<Typography variant="body2">
				{Number(bveCVX.toFixed(2))} <span className={classes.bveCVXAmount}>bveCVX</span>
			</Typography>
			<Typography variant="body2">
				{Number(bcvxCrv.toFixed(2))} <span className={classes.bveCVXAmount}>bcvxCrv</span>
			</Typography>
		</Box>
	);
};

const BveCvxBribeChart = ({ emissions }: Props) => {
	const classes = useStyles();

	return (
		<ResponsiveContainer width="99%" height={250}>
			<BarChart
				data={emissions}
				className={classes.root}
				margin={{ top: 20, bottom: 0, right: 20, left: 0 }}
			>
				<CartesianGrid strokeDasharray="4" vertical={false} />
				<XAxis dataKey="index" />
				<YAxis tickFormatter={format('^.2s')} />
				<Tooltip content={<CustomToolTip />} cursor={{ fill: '#3a3a3a' }} />
				<Legend />
				<Bar dataKey="badgerValue" stackId="a" fill="#F2A52B" legendType="none" />
				<Bar dataKey="bveCVXValue" stackId="a" fill="#A9731E" legendType="none" />
				<Bar dataKey="bcvxCrvValue" stackId="a" fill="#808080" legendType="none" />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default BveCvxBribeChart;
