import { Button, ButtonGroup, Card, CardContent, Tabs, Tab, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect } from 'react';

import AreaChart from './AreaChart';
import { observer } from 'mobx-react-lite';
import { fetchDiggChart } from '../../mobx/utils/helpers';
import { Loader } from 'components/Loader';

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
	const [chartData, setChartData] = useState<any>(undefined);
	const [range, setRange] = useState(7);
	const [title, setGraphSelected] = useState('Total Volume');
	const classes = useStyles();

	const handleGraphSelected = async (graph: string) => {
		const chart = graph === 'Price' ? 'prices' : graph === 'Total Volume' ? 'total_volumes' : 'market_caps';
		const diggChartData = await fetchDiggChart(chart, range);
		setChartData(diggChartData);
		setGraphSelected(graph);
	};

	const handleChangeRange = async (range: number) => {
		const chart = title === 'Price' ? 'prices' : title === 'Total Volume' ? 'total_volumes' : 'market_caps';
		const diggChartData = await fetchDiggChart(chart, range);
		setChartData(diggChartData);
		setRange(range);
	};

	useEffect(() => {
		const initialChartFetch = async () => {
			const diggChartData = await fetchDiggChart('total_volumes', 7);
			setChartData(diggChartData);
		};
		initialChartFetch();
	}, []);

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
				<Tab onClick={() => handleGraphSelected('Total Volume')} label="Total Volume" />
				<Tab onClick={() => handleGraphSelected('Price')} label="Price" />
				<Tab onClick={() => handleGraphSelected('Market cap')} label="Market cap" />
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
				<Loader message="Loading DIGG charts..." />
			</CardContent>
		</Card>
	);
});

export default DashboardCard;
