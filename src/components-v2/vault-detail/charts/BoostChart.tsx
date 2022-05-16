import React from 'react';
import { format } from 'd3-format';
import BaseAreaChart from './BaseAreaChart';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TooltipProps } from 'recharts';
import { makeStyles } from '@material-ui/core';
import { VaultDTO } from '@badger-dao/sdk';
import { BOOST_RANKS, MAX_BOOST, MAX_BOOST_RANK } from '../../../config/system/boost-ranks';
import { calculateUserBoost, calculateUserStakeRatio } from '../../../utils/boost-ranks';

const useStyles = makeStyles((theme) => ({
	tooltipContainer: {
		background: 'white',
		padding: theme.spacing(2),
		display: 'flex',
		flexDirection: 'column',
	},
}));

const boostCheckpoints = Array.from(Array(61)).map((_, i) => i * 50);

const yScaleFormatter = format('^.2%');

const BoostTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
	const classes = useStyles();
	if (!active || !payload || payload.length === 0) {
		return null;
	}
	const { x, y } = payload[0].payload;

	const stakeRatio = `${(calculateUserStakeRatio(x) * 100).toFixed(2)}%`;
	return (
		<div className={classes.tooltipContainer}>
			<span>Badger Boost: {label}</span>
			<span>Stake Ratio: {stakeRatio}</span>
			<span>Boosted APR: {yScaleFormatter(y)}</span>
		</div>
	);
};

interface Props {
	vault: VaultDTO;
}

export const BoostChart = ({ vault }: Props): JSX.Element | null => {
	const { sources, apr, minApr, maxApr } = vault;

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
		const rangeScalar = checkpoint / MAX_BOOST;
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
