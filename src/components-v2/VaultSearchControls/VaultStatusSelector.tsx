import React from 'react';
import { makeStyles, MenuItem, TextField } from '@material-ui/core';
import { VaultState } from '@badger-dao/sdk';

const useStyles = makeStyles({
	formControl: {
		width: '100%',
		textTransform: 'capitalize',
	},
	capitalized: {
		textTransform: 'capitalize',
	},
});

interface Props {
	status?: VaultState;
	onChange: (status: VaultState) => void;
}

const VaultStatusSelector = ({ status, onChange }: Props): JSX.Element => {
	const classes = useStyles();

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		onChange(event.target.value as VaultState);
	};

	return (
		<TextField
			select
			size="small"
			variant="outlined"
			id="demo-simple-select-outlined"
			value={status}
			onChange={handleChange}
			label="Status"
			color="primary"
			className={classes.formControl}
		>
			<MenuItem value={undefined}>
				<em>Status</em>
			</MenuItem>
			{Object.values(VaultState)
				.filter((status) => status !== VaultState.Deprecated)
				.map((status) => (
					<MenuItem className={classes.capitalized} key={status} value={status}>
						{status}
					</MenuItem>
				))}
		</TextField>
	);
};

export default VaultStatusSelector;
