import { Button, Grid, TextField, Typography } from '@material-ui/core';

import React from 'react';

const slippageOptions: string[] = ['0.5', '1.0', '3.0'];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Slippage = ({ values, classes, handleChange, handleSetMaxSlippage }: any) => (
	<Grid item xs={12}>
		<Typography variant="body1" color="textSecondary" style={{ textAlign: 'left' }}>
			Max slippage (%):
		</Typography>
		<div className={classes.row}>
			{slippageOptions.map((opt: string, idx: number) => (
				<Button
					key={`slippage-option-${idx}`}
					color={parseFloat(values.maxSlippage) === parseFloat(opt) ? 'primary' : 'default'}
					variant="contained"
					onClick={handleSetMaxSlippage(opt)}
					className={classes.menuItem}
				>
					{opt}%
				</Button>
			))}

			<TextField
				variant="outlined"
				size="small"
				value={values.maxSlippage}
				disabled={!!values.connectedAddress === false}
				placeholder="0.00"
				onChange={handleChange('maxSlippage')}
			/>
		</div>
	</Grid>
);
