import { Button, Grid } from '@material-ui/core';

import React from 'react';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const SuccessForm = ({ classes, resetState, values }: any) => (
	<Grid container alignItems={'center'}>
		<Grid item xs={12}>
			<div>{values.tabValue === 0 ? 'Minting' : 'Releasing'} was successful!</div>
		</Grid>
		{values.spacer}
		{values.spacer}
		<Grid container justify={'center'}>
			<Button
				variant="contained"
				color="primary"
				className={classes.button}
				onClick={(e) => {
					e.preventDefault();
					resetState();
				}}
			>
				Back to start
			</Button>
		</Grid>
	</Grid>
);
