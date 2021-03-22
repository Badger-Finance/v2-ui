import { Button, ButtonGroup, Card, CardContent, Tabs, Tab, CardHeader, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect } from 'react';

import AreaChart from './AreaChart';
import { observer } from 'mobx-react-lite';
import { fetchDiggChart } from '../../mobx/utils/helpers';

const useStyles = makeStyles((theme) => ({
	chartHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginRight: theme.spacing(4),
		marginBottom: theme.spacing(2),
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			paddingBottom: theme.spacing(2),
		},
	},
}));

const DashboardCard = observer(() => {
	const classes = useStyles();

	const componentDidMount = () => {
		handleChangeRange(7);
	};

	// Disable reason: Hook used for execution on mount.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(componentDidMount, []);
	const [title, setGraphSelected] = useState<string>('Total Volume');

	const handleChangeRange = (range: number) => {
		const chart = title === 'Price' ? 'prices' : title === 'Total Volume' ? 'total_volumes' : 'market_caps';

		fetchDiggChart(chart, range, (marketData: any) => {
			setChartData(marketData);
			setRange(range);
		});
	};
	useEffect(() => {
		handleChangeRange(range);
		// Disable reason: Hook used to trigger handleChangeRange() on change of 'title'.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title]);

	const [chartData, setChartData] = useState<any>(undefined);
	const [range, setRange] = useState<number>(7);

	const ranges = (
		<ButtonGroup variant="outlined" size="small" aria-label="outlined button group">
			<Button
				aria-label="1 day"
				disableElevation
				variant={range === 1 ? 'contained' : 'outlined'}
				onClick={() => handleChangeRange(1)}
			>
				1 day
			</Button>
			<Button
				aria-label="1 week"
				disableElevation
				variant={range === 7 ? 'contained' : 'outlined'}
				onClick={() => handleChangeRange(7)}
			>
				1 week
			</Button>
			<Button
				aria-label="1 Month"
				disableElevation
				variant={range === 30 ? 'contained' : 'outlined'}
				onClick={() => handleChangeRange(30)}
			>
				1 Month
			</Button>
		</ButtonGroup>
	);

	return !!chartData ? (
		<Card>
			<Tabs
				variant="fullWidth"
				indicatorColor="primary"
				value={['Total Volume', 'Price', 'Market cap'].indexOf(title)}
				style={{ background: 'rgba(0,0,0,.2)', marginBottom: '.5rem' }}
			>
				<Tab onClick={() => setGraphSelected('Total Volume')} label="Total Volume"></Tab>
				<Tab onClick={() => setGraphSelected('Price')} label="Price"></Tab>
				<Tab onClick={() => setGraphSelected('Market cap')} label="Market cap"></Tab>
			</Tabs>
			<div className={classes.chartHeader}>
				<CardHeader title={title} subheader="Drag the chart and pan the axes to explore." />
				<div>{ranges}</div>
			</div>
			<CardContent
				style={{
					paddingRight: '2rem',
					margin: '-2rem 0 0 0',
				}}
			>
				<AreaChart accent={'#F2A52B'} chartData={chartData} yPrefix={'$'} />
			</CardContent>
		</Card>
	) : (
		<Card style={{ padding: '1rem .6rem' }}>
			<CardContent
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '10rem',
				}}
			>
				<CircularProgress />
			</CardContent>
		</Card>
	);
});

export default DashboardCard;
