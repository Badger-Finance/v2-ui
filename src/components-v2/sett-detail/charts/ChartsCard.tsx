import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Tab, Tabs } from '@material-ui/core';
import { CardContainer } from '../styled';
import { Sett } from '../../../mobx/model/setts/sett';
import { ChartModeTitles } from '../utils';
import { ChartMode, SettChartData, SettChartTimeframe } from '../../../mobx/model/setts/sett-charts';
import { ChartsHeader } from './ChartsHeader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { SettChart } from './SettChart';
import ChartContent from './ChartContent';
import { BoostChart } from './BoostChart';

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
	return (data: SettChartData) => {
		const optionsFromMode: Record<string, number> = {
			[ChartMode.Value]: data.value,
			[ChartMode.Ratio]: data.ratio,
			[ChartMode.AccountBalance]: data.value,
		};

		return optionsFromMode[mode];
	};
};

interface Props {
	sett: Sett;
}

export const ChartsCard = observer(
	({ sett }: Props): JSX.Element => {
		const { settCharts } = useContext(StoreContext);

		const classes = useStyles();
		const [loading, setLoading] = useState(true);
		const [settChartData, setSettChartData] = useState<SettChartData[] | null>(null);
		const [mode, setMode] = useState(ChartMode.Value);
		const [timeframe, setTimeframe] = useState(SettChartTimeframe.Week);
		const boostableApr = sett.sources
			.filter((s) => s.boostable)
			.map((s) => s.apr)
			.reduce((total, apr) => (total += apr), 0);
		const baseApr = sett.apr - boostableApr;
		const boostData = sett.multipliers.map((m) => ({
			x: m.boost,
			y: (baseApr + m.multiplier * boostableApr) / 100,
		}));

		const yAxisAccessor = getYAxisAccessor(mode);
		const chartData = settChartData
			? settChartData.map((d) => ({ x: d.timestamp.getTime(), y: yAxisAccessor(d) }))
			: null;

		const handleFetchError = (error: Error) => {
			setLoading(false);
			console.error(error);
		};

		useEffect(() => {
			if (mode === ChartMode.Ratio && timeframe === SettChartTimeframe.Day) {
				setTimeframe(SettChartTimeframe.Week);
			}
		}, [mode, timeframe, settChartData]);

		useEffect(() => {
			const handleFetch = (fetchedData: SettChartData[] | null) => {
				setSettChartData(fetchedData);
				setLoading(false);
			};
			setLoading(true);
			settCharts.search(sett, timeframe).then(handleFetch).catch(handleFetchError);
		}, [sett, timeframe, settCharts]);

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
					{boostData.length > 0 && (
						<Tab
							onClick={() => setMode(ChartMode.BoostMultiplier)}
							value={ChartMode.BoostMultiplier}
							label={ChartModeTitles[ChartMode.BoostMultiplier]}
						/>
					)}
				</Tabs>
				<Grid container direction="column" className={classes.content}>
					<Grid item container alignItems="center" justify="space-between" className={classes.header}>
						<ChartsHeader mode={mode} timeframe={timeframe} onTimeframeChange={setTimeframe} />
					</Grid>
					<Grid item xs className={classes.chartContainer}>
						<ChartContent data={chartData} loading={loading}>
							<>
								{mode === ChartMode.Value || mode === ChartMode.Ratio ? (
									<SettChart mode={mode} timeframe={timeframe} data={chartData} />
								) : (
									<BoostChart baseline={sett.apr / 100} data={boostData} />
								)}
							</>
						</ChartContent>
					</Grid>
				</Grid>
			</CardContainer>
		);
	},
);
