import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { SpecsCard } from './specs/SpecsCard';

const useStyles = makeStyles((theme) => ({
	content: {
		marginTop: theme.spacing(3),
		margin: 'auto',
		[theme.breakpoints.up('md')]: {
			marginTop: theme.spacing(5),
		},
	},
}));

export const Content = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container className={classes.content}>
			<Grid item xs={12} lg={4}>
				<SpecsCard />
			</Grid>
		</Grid>
	);
};
