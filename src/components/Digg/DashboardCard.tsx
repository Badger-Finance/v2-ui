import {
	Button,
	ButtonGroup,
	Card,
	CardContent,
	CardActions,
	Typography,
	Tabs,
	Tab,
	CardHeader,
	CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect, useContext } from 'react';

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

const DashboardCard = observer((props: any) => {
	const classes = useStyles();

	const componentDidMount = () => {
		handleChangeRange(7);
	};

	useEffect(componentDidMount, []);
	const [title, setGraphSelected] = useState<string>('Supply');

	const handleChangeRange = (range: number) => {
		let chart = title === 'Price' ? 'prices' : title === 'Supply' ? 'total_volumes' : 'market_caps';

		fetchDiggChart(chart, range, (marketData: any) => {
			setChartData(marketData);
			setRange(range);
		});
	};
	useEffect(() => {
		handleChangeRange(range);
	}, [title]);

	const [chartData, setChartData] = useState<any>(undefined);
	const [range, setRange] = useState<number>(7);

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
			<Tabs

				variant="fullWidth"
				indicatorColor="primary"
				value={['Supply', 'Price', 'Market cap'].indexOf(title)}
				style={{ background: 'rgba(0,0,0,.2)', marginBottom: '.5rem' }}
			>
				<Tab onClick={() => setGraphSelected('Supply')} label="Supply"></Tab>
				<Tab onClick={() => setGraphSelected('Price')} label="Price"></Tab>
				<Tab onClick={() => setGraphSelected('Market cap')} label="Market cap"></Tab>
			</Tabs>
			<div className={classes.chartHeader}>
				<CardHeader title={title} subheader="Drag the chart and pan the axes to explore." />
				<div>{ranges}</div>
			</div>
			<CardContent
				style={{
					// paddingLeft: "2rem",
					paddingRight: '2rem',
					margin: '-2rem 0 0 0',
				}}
			>
				<AreaChart accent={'#F2A52B'} chartData={chartData} yPrefix={title === 'Price' && '$'} />
			</CardContent>

			{/* <CardActions style={{ display: 'flex', justifyContent: 'center', marginBottom: '.75rem' }}>
				<div style={{ display: 'flex' }}>
					<div style={{ marginLeft: '1rem', textAlign: 'center' }}>
						<Typography variant="body2" color="textPrimary">
							<Typography variant="body2" color="textSecondary">
								High
							</Typography>
							{title === 'Price' && '$'}
							{intToString(chartData.calcs.high)}
						</Typography>
					</div>
					<div style={{ marginLeft: '1rem', textAlign: 'center' }}>
						<Typography variant="body2" color="textPrimary">
							<Typography variant="body2" color="textSecondary">
								Low
							</Typography>
							{title === 'Price' && '$'}
							{intToString(chartData.calcs.low)}
						</Typography>
					</div>
					<div style={{ marginLeft: '1rem', textAlign: 'center' }}>
						<Typography variant="body2" color="textPrimary">
							<Typography variant="body2" color="textSecondary">
								Average
							</Typography>
							{title === 'Price' && '$'}
							{intToString(chartData.calcs.avg)}
						</Typography>
					</div>
					<div style={{ marginLeft: '1rem', textAlign: 'center' }}>
						<Typography variant="body2" color="textPrimary">
							<Typography variant="body2" color="textSecondary">
								Median
							</Typography>
							{title === 'Price' && '$'}
							{intToString(chartData.calcs.median)}
						</Typography>
					</div>
				</div>
			</CardActions> */}
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
