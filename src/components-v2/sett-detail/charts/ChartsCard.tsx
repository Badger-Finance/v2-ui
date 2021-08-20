import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { ChartContent } from './ChartContent';
import { Sett } from '../../../mobx/model/setts/sett';
import { ChartMode, SettChartData, SettChartTimeframe } from '../../../mobx/model/setts/sett-charts';
import { ChartsHeader } from './ChartsHeader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { SettBalance } from '../../../mobx/model/setts/sett-balance';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		maxWidth: '100%',
		height: '100%',
	},
	content: {
		flexGrow: 1,
		maxWidth: '100%',
		flexShrink: 0,
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

interface Props {
	sett: Sett;
	mode: ChartMode;
	settBalance?: SettBalance;
}

export const ChartsCard = observer(
	({ sett, settBalance, mode }: Props): JSX.Element => {
		const { settCharts } = useContext(StoreContext);

		const classes = useStyles();
		const [loading, setLoading] = useState(false);
		const [chartData, setChartData] = useState<SettChartData[] | null>(null);
		const [timeframe, setTimeframe] = useState(SettChartTimeframe.week);

		const accountScalar = settBalance ? settBalance.value / sett.value : undefined;

		const handleFetch = (fetchedData: SettChartData[] | null) => {
			setChartData(fetchedData);
			setLoading(false);
		};

		const handleFetchError = (error: Error) => {
			setLoading(false);
			console.error(error);
		};

		React.useEffect(() => {
			setLoading(true);
			settCharts.search(sett, timeframe).then(handleFetch).catch(handleFetchError);
		}, [sett, timeframe, settCharts]);

		return (
			<div className={classes.root}>
				<Grid container direction="column" className={classes.content}>
					<Grid item container alignItems="center" justify="space-between" className={classes.header}>
						<ChartsHeader mode={mode} timeframe={timeframe} onTimeframeChange={setTimeframe} />
					</Grid>
					<Grid item xs className={classes.chartContainer}>
						<ChartContent mode={mode} data={chartData} accountScalar={accountScalar} loading={loading} />
					</Grid>
				</Grid>
			</div>
		);
	},
);
