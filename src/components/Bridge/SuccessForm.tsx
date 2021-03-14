import React from 'react';
import { Grid, Button } from '@material-ui/core';

export const SuccessForm = (props: any) => {
	const { classes, resetState, values } = props;

	const gotoStart = (e: any) => {
		e.preventDefault();
		resetState();
	};

	return (
		<Grid container alignItems={'center'}>
			<Grid item xs={12}>
				<div>{values.tabValue === 0 ? 'Minting' : 'Releasing'} was successful!</div>
			</Grid>
			{values.spacer}
			{values.spacer}
			<Grid container justify={'center'}>
				<Button variant="contained" color="primary" className={classes.button} onClick={gotoStart}>
					Back to start
				</Button>
			</Grid>
		</Grid>
	);
};
