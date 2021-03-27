import { Paper, Typography, makeStyles } from '@material-ui/core';

import React from 'react';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	statPaper: {
		[theme.breakpoints.up('sm')]: {
			padding: theme.spacing(2),
		},
		textAlign: 'center',
		minHeight: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	submetricContainer: {
		paddingBottom: theme.spacing(),
	},
	down: {
		color: theme.palette.error.main,
	},
	up: {
		color: theme.palette.success.main,
	},
}));

type SubmetricData = {
	title: string;
	value: string;
	change?: boolean;
};

type MetricProps = {
	metric: string;
	value: string;
	submetrics?: Array<SubmetricData>;
};

const Metric = observer((props: MetricProps) => {
	const { metric, value } = props;
	const classes = useStyles();

	return (
		<Paper className={classes.statPaper} elevation={3}>
			<Typography variant="subtitle1">{metric}</Typography>
			<Typography variant="h5">{value || '...'}</Typography>
			{/* <List className={classes.submetricContainer}>
				{submetrics?.map(submetric => <SubMetric title={submetric.title} value={submetric.value} change={submetric.change} />)}
			</List> */}
		</Paper>
	);
});

export default Metric;
