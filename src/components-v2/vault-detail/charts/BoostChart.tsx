import React, { useContext } from 'react';
import { format } from 'd3-format';
import BaseAreaChart from './BaseAreaChart';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TooltipProps } from 'recharts';
import { makeStyles } from '@material-ui/core';
import { VaultDTO } from '@badger-dao/sdk';
import { MAX_BOOST } from '../../../config/system/boost-ranks';
import { calculateUserStakeRatio } from '../../../utils/boost-ranks';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';

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
// short visual trick to just show 1 as min boost instead of 0 graph wise - there is no impact
const xScaleFormatter = (value: number): string => (value === 0 ? '1' : value.toString());

const BoostTooltip = observer(({ active, payload }: TooltipProps<ValueType, NameType>) => {
	const {
		vaults: { vaultsFilters },
	} = useContext(StoreContext);
	const classes = useStyles();

	if (!active || !payload || payload.length === 0) {
		return null;
	}
	const { x, y } = payload[0].payload;
	const xValue = x === 0 ? 1 : x;
	const mode = vaultsFilters.showAPR ? 'APR' : 'APY';

	const stakeRatio = `${(calculateUserStakeRatio(xValue) * 100).toFixed(2)}%`;
	return (
		<div className={classes.tooltipContainer}>
			<span>Badger Boost: {xValue}</span>
			<span>Stake Ratio: {stakeRatio}</span>
			<span>
				Boosted {mode}: {yScaleFormatter(y)}
			</span>
		</div>
	);
});

interface Props {
	vault: VaultDTO;
}

export const BoostChart = observer(({ vault }: Props): JSX.Element | null => {
	const {
		vaults: { vaultsFilters },
	} = useContext(StoreContext);

	const { sources, apr, minApr, maxApr, sourcesApy } = vault;

	if (!minApr || !maxApr) {
		return null;
	}

	const mode = vaultsFilters.showAPR ? 'APR' : 'APY';
	const boostSources = vaultsFilters.showAPR ? sources : sourcesApy;

	const boostableApr = boostSources
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
			title={`Badger Boost ${mode}`}
			data={boostData}
			xFormatter={xScaleFormatter}
			yFormatter={yScaleFormatter}
			width="99%" // needs to be 99% see https://github.com/recharts/recharts/issues/172#issuecomment-307858843
			customTooltip={<BoostTooltip />}
			references={[{ value: apr / 100, label: `Baseline ${mode} (${apr.toFixed(2)}%)` }]}
		/>
	);
});
