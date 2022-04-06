import React from 'react';
import { Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { CheckboxControlProps } from './types';

const PortfolioDustControl = ({ checked, onChange, ...muiProps }: CheckboxControlProps): JSX.Element => {
	const handleDustChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.checked);
	};

	return (
		<FormControlLabel
			{...muiProps}
			control={<Checkbox checked={checked} color="primary" onChange={handleDustChange} />}
			label={<Typography variant="body2">Hide dust</Typography>}
		/>
	);
};

export default PortfolioDustControl;
