import {
	Button,
	ButtonGroup,
	Card,
	CardContent,
	CardActions,
	Typography,
	CardHeader,
	CircularProgress,
} from '@material-ui/core';
import React, { useState, useEffect } from 'react';

import AreaChart from './AreaChart';
import { observer } from 'mobx-react-lite';

import { fetchDiggChart } from '../../mobx/utils/helpers';

const DashboardCard = observer((props: any) => {
	const componentDidMount = () => {
		handleChangeRange(30);
	};

	useEffect(componentDidMount, []);

	const handleChangeRange = (range: number) => {
		const chart = props.title === 'Price' ? 'prices' : props.title === 'Supply' ? 'total_volumes' : 'market_caps';

		fetchDiggChart(chart, range, (marketData: any) => {
			setChartData(marketData);
			setRange(range);
		});
	};

	const [chartData, setChartData] = useState<any>(undefined);
	const [range, setRange] = useState<number>(420);

	const ranges = (
		<ButtonGroup variant="outlined" size="small" aria-label="outlined button group">
			<Button
				disableElevation
				variant={range === 1 ? 'contained' : 'outlined'}
				onClick={() => handleChangeRange(1)}
			>
				1 day
			</Button>
			<Button
				disableElevation
				variant={range === 7 ? 'contained' : 'outlined'}
				onClick={() => handleChangeRange(7)}
			>
				1 week
			</Button>
			<Button
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
			<CardHeader
				title={props.title}
				action={ranges}
				subheader="Drag the chart and pan the axes to explore."
			></CardHeader>
			<CardContent></CardContent>
			<CardContent
				style={{
					// paddingLeft: "2rem",
					paddingRight: '2rem',
					margin: '-2rem 0 0 0',
				}}
			>
				<AreaChart accent={'#F2A52B'} chartData={chartData} yPrefix={props.title === 'Price' && '$'} />
			</CardContent>

			<CardActions style={{ display: 'flex', justifyContent: 'start' }}>
				<div style={{ display: 'flex', marginRight: '.5rem' }}>
					<Typography variant="body2" color="textPrimary">
						<Typography variant="body2" color="textSecondary">
							High
						</Typography>
						{props.title === 'Price' && '$'}
						{intToString(chartData.calcs.high)}
					</Typography>
				</div>
				<div style={{ display: 'flex', marginRight: '.5rem' }}>
					<Typography variant="body2" color="textPrimary">
						<Typography variant="body2" color="textSecondary">
							Low
						</Typography>
						{props.title === 'Price' && '$'}
						{intToString(chartData.calcs.low)}
					</Typography>
				</div>
				<div style={{ display: 'flex', marginRight: '.5rem' }}>
					<Typography variant="body2" color="textPrimary">
						<Typography variant="body2" color="textSecondary">
							Average
						</Typography>
						{props.title === 'Price' && '$'}
						{intToString(chartData.calcs.avg)}
					</Typography>
				</div>
				<div style={{ display: 'flex', marginRight: '.5rem' }}>
					<Typography variant="body2" color="textPrimary">
						<Typography variant="body2" color="textSecondary">
							Median
						</Typography>
						{props.title === 'Price' && '$'}
						{intToString(chartData.calcs.median)}
					</Typography>
				</div>
			</CardActions>
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

const intToString = (n: number) => {
	if (n < 1e3) return n;
	if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'k';
	if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'm';
	if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B';
	if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T';
};

export default DashboardCard;
