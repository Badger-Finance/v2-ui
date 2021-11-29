import React from 'react';
import { Grid, Button, TextField, Typography } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

const slippageOptions: string[] = ['0.5', '1.0', '3.0'];

export interface ValuesProp {
	token: string;
	amount: string;
	receiveAmount: number;
	step: number;
	burnAmount: string;
	btcAddr: string;
	tabValue: number;
	spacer: JSX.Element;
	estimatedSlippage: number;
	maxSlippage: string;
	renFee: number;
	badgerFee: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SlippageProps {
	values: ValuesProp;
	classes: ClassNameMap;
	handleChange(name: string): (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
	handleSetMaxSlippage(newValue: string): () => void;
	disabled: boolean;
}

export const Slippage = (props: SlippageProps): JSX.Element => {
	const { values, classes, handleChange, handleSetMaxSlippage, disabled } = props;
	const containerClasses = clsx(classes.row, classes.mobileContainer);

	return (
		<Grid item xs={12}>
			<Typography variant="body1" color="textSecondary" style={{ textAlign: 'left' }}>
				Max slippage (%):
			</Typography>
			<div className={containerClasses}>
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
					className={classes.mobileContainer}
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
