import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
	root: {
		marginBottom: 20,
		wordBreak: 'break-all',
	},
	amount: {
		fontSize: 28,
		lineHeight: '1.334',
	},
}));

export const Value = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			<Typography>Value</Typography>
			<StyledDivider />
			<Typography className={classes.amount}>$7,921,648.24</Typography>
		</Grid>
	);
};
