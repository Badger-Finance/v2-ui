import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
	specName: {
		fontSize: 12,
		lineHeight: '1.66',
	},
}));

export const Fees = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container>
			<Typography>Fees</Typography>
			<StyledDivider />
			<Grid container>
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						Withdrawal Fee
					</Typography>
					<Typography display="inline" variant="subtitle2">
						0.5%
					</Typography>
				</Grid>
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						Performance Fee
					</Typography>
					<Typography display="inline" variant="subtitle2">
						20.0%
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
};
