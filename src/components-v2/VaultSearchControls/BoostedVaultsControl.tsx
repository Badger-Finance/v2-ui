import { Checkbox, FormControlLabel, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

import { CheckboxControlProps } from './types';

const useStyles = makeStyles((theme) => ({
	label: {
		color: theme.palette.primary.main,
	},
}));

const BoostedVaultsControl = ({ checked, onChange, ...muiProps }: CheckboxControlProps): JSX.Element => {
	const classes = useStyles();

	const handleBoostedVaults = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.checked);
	};

	return (
		<FormControlLabel
			{...muiProps}
			className={clsx(classes.label, muiProps.className)}
			control={<Checkbox checked={checked} color="primary" onChange={handleBoostedVaults} />}
			label={<Typography variant="body2">🚀 Boosted Vaults</Typography>}
		/>
	);
};

export default BoostedVaultsControl;
