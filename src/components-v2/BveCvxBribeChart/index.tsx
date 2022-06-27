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
import { EmissionSchedule, ONE_DAY_MS } from '@badger-dao/sdk';
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

const ROUND_ONE_START = 1632182660;
const BADGER_TOKEN = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
const BVE_CVX_TOKEN = '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305';

function bucketSchedules(schedules: EmissionSchedule[]): BveCvxEmissionRound[] {
	const schedulesByRound: Record<number, EmissionSchedule[]> = {};

	for (let schedule of schedules) {
		let round = Math.ceil((schedule.start - ROUND_ONE_START) / (14 * (ONE_DAY_MS / 1000)));

		// we have some weird schedules that are bad entries
		if (round < 1) {
			continue;
		}

		if (!schedulesByRound[round]) {
			schedulesByRound[round] = [];
		}

		let maybeOverlap = schedulesByRound[round].find((e) => {
			return e.token === schedule.token && Math.abs(e.start - schedule.start) > 12 * (ONE_DAY_MS / 1000);
		});

		while (maybeOverlap) {
			round += 1;

			if (!schedulesByRound[round]) {
				schedulesByRound[round] = [];
			}

			maybeOverlap = schedulesByRound[round].find((e) => {
				return e.token === schedule.token && Math.abs(e.start - schedule.start) > 12 * (ONE_DAY_MS / 1000);
			});
		}

		schedulesByRound[round].push(schedule);
	}

	console.log(JSON.stringify(schedulesByRound));

	return Object.entries(schedulesByRound).map((e) => {
		const [round, schedules] = e;

		let totalBadger = 0;
		let totalBveCvx = 0;
		let start = Number.MAX_SAFE_INTEGER;

		for (let schedule of schedules) {
			if (schedule.start < start) {
				start = schedule.start;
			}
			if (schedule.token === BADGER_TOKEN) {
				totalBadger += schedule.amount;
			}
			if (schedule.token === BVE_CVX_TOKEN) {
				totalBveCvx += schedule.amount;
			}
		}

		return {
			index: Number(round),
			badger: totalBadger,
			bveCVX: totalBveCvx,
			start,
		};
	});
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
	// const chartEmissions = emissions.map((item) => formatToChartEmission(item));
	const emissionsByRound = bucketSchedules(emissions);

	return (
		<ResponsiveContainer width="99%" height={250}>
			<BarChart
				// in the first round only one badger was emitted, so we skip it
				data={emissionsByRound}
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
