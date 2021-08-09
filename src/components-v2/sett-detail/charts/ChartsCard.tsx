import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Tab, Tabs } from '@material-ui/core';
import { ChartContent } from './ChartContent';
import { CardContainer } from '../styled';
import { Sett } from '../../../mobx/model/setts/sett';
import { fetchSettInformation, SettChartTimeframe } from './utils';
import { DEBUG } from '../../../config/constants';
import { SettChartData } from '../../../mobx/model/setts/sett-charts';
import { ChartsHeader } from './ChartsHeader';

export type ChartMode = 'value' | 'ratio';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
	},
	content: {
		flexGrow: 1,
		maxWidth: '100%',
		flexShrink: 0,
		padding: theme.spacing(2, 3),
	},
	tabHeader: { background: 'rgba(0,0,0,.2)' },
	header: {
		marginBottom: theme.spacing(2),
	},
	chartContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
}));

interface Props {
	sett: Sett;
}

export const ChartsCard = ({ sett }: Props): JSX.Element => {
	const classes = useStyles();
	const [loading, setLoading] = useState(false);
	const [chartData, setChartData] = useState<SettChartData[] | null>(null);
	const [mode, setMode] = useState<ChartMode>('value');
	const [timeframe, setTimeframe] = useState(SettChartTimeframe.week);

	const doFetch = useCallback(async () => {
		try {
			setLoading(true);
			const data = await fetchSettInformation(sett, timeframe);
			setChartData(data);
		} catch (error) {
			if (DEBUG) console.error(error);
		} finally {
			setLoading(false);
		}
	}, [sett, timeframe]);

	React.useEffect(() => {
		// reason: the functions already has a try-catch
		// eslint-disable-next-line promise/catch-or-return,promise/valid-params
		doFetch();
	}, [doFetch]);

	return (
		<CardContainer className={classes.root}>
			<Tabs
				variant="fullWidth"
				className={classes.tabHeader}
				textColor="primary"
				aria-label="IbBTC Tabs"
				indicatorColor="primary"
				value={mode}
			>
				<Tab onClick={() => setMode('value')} value="value" label="Value" />
				<Tab onClick={() => setMode('ratio')} value="ratio" label="Token Ratio" />
			</Tabs>
			<Grid container direction="column" className={classes.content}>
				<Grid item container alignItems="center" justify="space-between" className={classes.header}>
					<ChartsHeader mode={mode} timeframe={timeframe} onTimeframeChange={setTimeframe} />
				</Grid>
				<Grid item xs className={classes.chartContainer}>
					<ChartContent mode={mode} data={chartData} loading={loading} />
				</Grid>
			</Grid>
		</CardContainer>
	);
};
