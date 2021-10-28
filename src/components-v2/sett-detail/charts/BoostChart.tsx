import React from 'react';
import { format } from 'd3-format';
import BaseAreaChart from './BaseAreaChart';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TooltipProps } from 'recharts';
import { makeStyles } from '@material-ui/core';
import { BOOST_LEVELS, MAX_BOOST_LEVEL } from 'config/system/boost-ranks';
import { Sett } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	tooltipContainer: {
		background: 'white',
		padding: theme.spacing(2),
		display: 'flex',
		flexDirection: 'column',
	},
}));

// hard coded expected badger boost values
// note: this is a bandaid over exposing the true multiplier values
// TODO: expose multiplier chart data once multichain boost is sorted
const boostCheckpoints = BOOST_LEVELS.flatMap((level) => level.multiplier);

const yScaleFormatter = format('^.2%');

const BoostTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
	const classes = useStyles();
	if (!active || !payload || payload.length === 0) {
		return null;
	}
	const { x, y } = payload[0].payload;
	const stakeRatio = `${(x / 20).toFixed(2)}%`;
	return (
		<div className={classes.tooltipContainer}>
			<span>Badger Boost: {label}</span>
			<span>Stake Ratio: {stakeRatio}</span>
			<span>Boosted APR: {yScaleFormatter(y)}</span>
		</div>
	);
};

interface Props {
	sett: Sett;
}

export const BoostChart = ({ sett }: Props): JSX.Element | null => {
	const { sources, apr, minApr, maxApr } = sett;

	if (!minApr || !maxApr) {
		return null;
	}

	const boostableApr = sources
		.filter((s) => s.boostable)
		.map((s) => s.apr)
		.reduce((total, apr) => (total += apr), 0);
	const baseApr = apr - boostableApr;
	const aprRange = maxApr - minApr;
	const boostData = boostCheckpoints.map((checkpoint) => {
		const rangeScalar = checkpoint / MAX_BOOST_LEVEL.multiplier;
		return {
			x: checkpoint,
			y: (baseApr + rangeScalar * aprRange) / 100,
		};
	});

	return (
		<BaseAreaChart
			title={'Badger Boost APR'}
			data={boostData}
			yFormatter={yScaleFormatter}
			width="99%" // needs to be 99% see https://github.com/recharts/recharts/issues/172#issuecomment-307858843
			customTooltip={<BoostTooltip />}
			references={[{ value: apr / 100, label: `Baseline APR (${apr.toFixed(2)}%)` }]}
		/>
	);
};
