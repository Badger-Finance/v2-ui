import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Tab, Tabs } from '@material-ui/core';
import { CardContainer } from '../styled';
import { ChartModeTitles } from '../utils';
import { ChartMode, VaultChartData, VaultChartTimeframe } from '../../../mobx/model/vaults/vault-charts';
import { ChartsHeader } from './ChartsHeader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { VaultChart } from './VaultChart';
import ChartContent from './ChartContent';
import { BoostChart } from './BoostChart';
import { VaultDTO } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		maxWidth: '100%',
	},
	content: {
		flexGrow: 1,
		maxWidth: '100%',
		flexShrink: 0,
		padding: theme.spacing(2, 3),
	},
	tabHeader: { background: 'rgba(0,0,0,.2)' },
	header: {
		marginBottom: theme.spacing(3),
	},
	chartContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
}));

const getYAxisAccessor = (mode: ChartMode) => {
	return (data: VaultChartData) => {
		const optionsFromMode: Record<string, number> = {
			[ChartMode.Value]: data.value,
			[ChartMode.Ratio]: data.pricePerFullShare,
			[ChartMode.AccountBalance]: data.value,
		};

		return optionsFromMode[mode];
	};
};

interface Props {
	vault: VaultDTO;
}

export const ChartsCard = observer(({ vault }: Props): JSX.Element => {
	const { vaultCharts } = useContext(StoreContext);
	const { minApr, maxApr } = vault;
	const isBoostable = minApr && maxApr;

	const classes = useStyles();
	const [settChartData, setVaultChartData] = useState<VaultChartData[] | null>(null);
	const [mode, setMode] = useState(isBoostable ? ChartMode.BoostMultiplier : ChartMode.Value);
	const [loading, setLoading] = useState(!isBoostable);
	const [timeframe, setTimeframe] = useState(VaultChartTimeframe.Week);

	const yAxisAccessor = getYAxisAccessor(mode);
	const chartData = settChartData
		? settChartData.map((d) => ({ x: d.timestamp.getTime(), y: yAxisAccessor(d) }))
		: null;

	const handleFetch = (fetchedData: VaultChartData[] | null) => {
		setVaultChartData(fetchedData);
		setLoading(false);
	};

	const handleFetchError = (error: Error) => {
		setLoading(false);
		console.error(error);
	};

	useEffect(() => {
		if (mode === ChartMode.Ratio && timeframe === VaultChartTimeframe.Day) {
			setTimeframe(VaultChartTimeframe.Week);
		}
	}, [mode, timeframe]);

	useEffect(() => {
		setLoading(true);
		vaultCharts.search(vault, timeframe).then(handleFetch).catch(handleFetchError);
	}, [vault, timeframe, vaultCharts]);

	return (
		<CardContainer className={classes.root}>
			<Tabs
				variant="fullWidth"
				className={classes.tabHeader}
				textColor="primary"
				aria-label="chart view options"
				indicatorColor="primary"
				value={mode}
			>
				{isBoostable && (
					<Tab
						onClick={() => setMode(ChartMode.BoostMultiplier)}
						value={ChartMode.BoostMultiplier}
						label={ChartModeTitles[ChartMode.BoostMultiplier]}
					/>
				)}
				<Tab
					onClick={() => setMode(ChartMode.Value)}
					value={ChartMode.Value}
					label={ChartModeTitles[ChartMode.Value]}
				/>
				<Tab
					onClick={() => setMode(ChartMode.Ratio)}
					value={ChartMode.Ratio}
					label={ChartModeTitles[ChartMode.Ratio]}
				/>
			</Tabs>
			<Grid container direction="column" className={classes.content}>
				<Grid item container alignItems="center" justifyContent="space-between" className={classes.header}>
					<ChartsHeader mode={mode} timeframe={timeframe} onTimeframeChange={setTimeframe} />
				</Grid>
				<Grid item xs className={classes.chartContainer}>
					<ChartContent data={chartData} loading={loading}>
						<>
							{mode === ChartMode.Value || mode === ChartMode.Ratio ? (
								<VaultChart mode={mode} timeframe={timeframe} data={chartData} />
							) : (
								<BoostChart vault={vault} />
							)}
						</>
					</ChartContent>
				</Grid>
			</Grid>
		</CardContainer>
	);
});
