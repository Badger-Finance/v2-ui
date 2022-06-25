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
import { EmissionSchedule } from '@badger-dao/sdk';
import { groupBy } from '../../utils/lodashToNative';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { StyledDivider } from '../vault-detail/styled';
import { sliceIntoChunks } from '../../utils/componentHelpers';
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
	emissions: EmissionSchedule[];
}

function formatToChartEmission(emission: EmissionSchedule): BveCvxEmissionRound {
	const badger = emission.token === '0x3472A5A71965499acd81997a54BBA8D852C6E53d' ? emission.amount : 0;
	const bveCVX = emission.token === '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305' ? emission.amount : 0;
	return { badger, bveCVX, start: emission.start, index: 0 };
}

function mergeEmissions(emissions: BveCvxEmissionRound[], index = 0): BveCvxEmissionRound {
	const initialRound: BveCvxEmissionRound = {
		...emissions[0],
		badger: 0,
		bveCVX: 0,
		index,
	};
	return emissions.reduce((acc, curr) => {
		return {
			...acc,
			badger: acc.badger + curr.badger,
			bveCVX: acc.bveCVX + curr.bveCVX,
		};
	}, initialRound);
}

const CustomToolTip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
	const classes = useStyles();

	if (!active || !payload || payload.length === 0) {
		return null;
	}

	const { badger, bveCVX, index } = payload[0].payload;

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
		</Box>
	);
};

const BveCvxBribeChart = ({ emissions }: Props) => {
	const classes = useStyles();
	const chartEmissions = emissions.map((item) => formatToChartEmission(item));
	const emissionsByTimestamp = groupBy(chartEmissions, (item) => item.start);

	// the api logs each token emission separately even if they were emitted at the same
	// therefore we need to merge them together
	const aggregatedEmissions = Object.values(emissionsByTimestamp).map((item) => mergeEmissions(item));

	// each round consists of two weeks of emissions
	const biWeeklyEmissions = sliceIntoChunks(aggregatedEmissions, 2);
	const emissionRounds = biWeeklyEmissions.map((item, index) => mergeEmissions(item, index));

	return (
		<ResponsiveContainer width="99%" height={250}>
			<BarChart
				// in the first round only one badger was emitted, so we skip it
				data={emissionRounds.slice(1)}
				className={classes.root}
				margin={{ top: 20, bottom: 0, right: 20, left: 0 }}
			>
				<CartesianGrid strokeDasharray="4" vertical={false} />
				<XAxis dataKey="index" />
				<YAxis tickFormatter={format('^.2s')} />
				<Tooltip content={<CustomToolTip />} cursor={{ fill: '#3a3a3a' }} />
				<Legend />
				<Bar dataKey="badger" stackId="a" fill="#F2A52B" legendType="none" />
				<Bar dataKey="bveCVX" stackId="a" fill="#A9731E" legendType="none" />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default BveCvxBribeChart;
