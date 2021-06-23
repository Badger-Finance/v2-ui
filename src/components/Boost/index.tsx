import React from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Container, Link } from '@material-ui/core';
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
	footerContainer: {
		textAlign: 'center',
		textDecoration: 'underline',
		padding: theme.spacing(2) + 'px !important',
	},
}));

export const Boost = observer(() => {
	const classes = useStyles();

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="center">
				<Grid item xs={12} className={classes.headerContainer}>
					<PageHeader title="Boost Optimizer" subtitle="Calculate the amounts required for your boost." />
				</Grid>
				<Grid item xs={12}>
					<BoostCalculator />
				</Grid>
				<Grid item xs={12} className={classes.footerContainer}>
					<Link>How Does Boosts Work?</Link>
				</Grid>
			</Grid>
		</Container>
	);
});
