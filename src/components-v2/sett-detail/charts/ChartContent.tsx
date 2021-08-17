import React from 'react';
import { SettChart } from './SettChart';
import { Grid, Typography } from '@material-ui/core';
import { Loader } from '../../../components/Loader';
import { SettChartData } from '../../../mobx/model/setts/sett-charts';
import { ChartMode } from './ChartsCard';
import { makeStyles } from '@material-ui/core/styles';
import ErrorIcon from '@material-ui/icons/Error';

const useStyles = makeStyles((theme) => ({
	errorMessage: {
		marginTop: theme.spacing(1),
	},
	errorIcon: {
		fontSize: 60,
	},
}));

const accountScaleData = (data: SettChartData[], scalar: number) => {
	return data.map((point) => ({ ...point, value: point.value * scalar }));
};

interface Props {
	mode: ChartMode;
	accountScalar?: number;
	data: SettChartData[] | null;
	loading?: boolean;
}

export const ChartContent = ({ data, accountScalar, mode, loading = true }: Props): JSX.Element => {
	const classes = useStyles();

	if (loading) {
		return <Loader message="Loading chart information" />;
	}

	if (!data) {
		return (
			<Grid container direction="column" justify="center" alignItems="center">
				<ErrorIcon className={classes.errorIcon} />
				<Typography variant="body1" className={classes.errorMessage}>
					Something went wrong, please refresh the page.
				</Typography>
			</Grid>
		);
	}

	if (mode === ChartMode.accountBalance && accountScalar) {
		return <SettChart data={accountScaleData(data, accountScalar)} mode={mode} />;
	}

	return <SettChart data={data} mode={mode} />;
};
