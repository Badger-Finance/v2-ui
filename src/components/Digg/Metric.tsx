import { Typography, Paper, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React from 'react';

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

export interface MetricProps {
	metric: string;
	value?: string;
}

const Metric = observer((props: MetricProps) => {
	const { metric, value } = props;
	const classes = useStyles();

	return (
		<Paper className={classes.statPaper} elevation={3}>
			<Typography variant="subtitle1">{metric}</Typography>
			<Typography variant="h5">{value || '...'}</Typography>
		</Paper>
	);
});

export default Metric;
