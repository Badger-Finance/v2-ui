import { Typography, Paper, makeStyles, ListItem, List, ListItemSecondaryAction } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import React from "react";

const useStyles = makeStyles((theme) => ({
	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		minHeight: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	submetric: {
		// display: 'flex',
		// flexDirection: 'column',
		// flexBasis: '50%',
	},
	submetricContainer: {
		// display: 'flex',
		// justifyContent: 'space-around',
		// flexGrow: 1,
		paddingBottom: theme.spacing(),
	},
	down: {
		color: theme.palette.error.main,
	},
	up: {
		color: theme.palette.success.main,
	},
	submetricTitle: {
		marginTop: 'auto',
	}
}));

type SubmetricData = {
	title: string,
	value: string,
	change?: boolean,
};

type MetricProps = {
	metric: string,
	value: string,
	submetrics?: Array<SubmetricData>,
}

const SubMetric = observer((props: SubmetricData) => {
	const { title, value, change } = props;
	const classes = useStyles();

	const intValue = parseInt(value);
	const metricValue = change ? `${intValue < 0 ? '' : '+'}${value}%` : value;
	const metricValueClass = change ? intValue < 0 ? classes.down : classes.up : undefined;
	return (
		<ListItem className={classes.submetric}>
			<Typography variant="caption" className={classes.submetricTitle}>{title}</Typography>
			<ListItemSecondaryAction>
				<Typography variant="caption" className={metricValueClass}>{metricValue || '...'}</Typography>
			</ListItemSecondaryAction>
		</ListItem>
	);
});

const Metric = observer((props: MetricProps) => {
	const { metric, value, submetrics } = props;
	const classes = useStyles();

	return (
		<Paper className={classes.statPaper} elevation={3}>
			<Typography variant="subtitle1">{metric}</Typography>
			<Typography variant="h5">{value || '...'}</Typography>
			<List className={classes.submetricContainer}>
				{submetrics?.map(submetric => <SubMetric title={submetric.title} value={submetric.value} change={submetric.change} />)}
			</List>
		</Paper>
	);
});

export default Metric;
