import React from 'react';
import { Grid, Button, TextField, Typography } from '@material-ui/core';

const slippageOptions: string[] = ['0.5', '1.0', '3.0'];

export const Slippage = (props: any) => {
	const { values, classes, handleChange, handleSetMaxSlippage } = props;
	return (
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
};
