import React from 'react';
import { Grid, Button, TextField, Typography } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

const slippageOptions: string[] = ['0.5', '1.0', '3.0'];

export interface ValuesProp {
	token: string;
	amount: string;
	receiveAmount: number;
	step: number;
	burnAmount: string;
	btcAddr: string;
	shortAddr: string;
	tabValue: number;
	// TODO: Needs react Element type.
	spacer: any;
	estimatedSlippage: number;
	maxSlippage: string;
	renFee: number;
	badgerFee: number;
}

interface SlippageProps {
	values: any;
	classes: ClassNameMap;
	handleChange(name: string): (event: any) => Promise<void>;
	handleSetMaxSlippage(newValue: string): void;
	disabled: boolean;
}

export const Slippage = (props: any) => {
	const { values, classes, handleChange, handleSetMaxSlippage, disabled } = props;
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
					disabled={disabled}
					placeholder="0.00"
					onChange={handleChange('maxSlippage')}
				/>
			</div>
		</Grid>
	);
};
