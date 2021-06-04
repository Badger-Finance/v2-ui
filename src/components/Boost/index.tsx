import React from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BoostCalculator } from './BoostCalculator';
import PageHeader from '../../components-v2/common/PageHeader';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(30),
		},
	},
	headerContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
}));

export const Boost = observer(() => {
	const classes = useStyles();

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="flex-start">
				<Grid item xs={12} className={classes.headerContainer}>
					<PageHeader title="Boost Optimizer" subtitle="Calculate the amounts required for your boost." />
				</Grid>
				<BoostCalculator />
			</Grid>
		</Container>
	);
});
