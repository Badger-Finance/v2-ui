import React from 'react';
import { makeStyles, MenuItem, TextField } from '@material-ui/core';
import { VaultState } from '@badger-dao/sdk';
import SelectControlsChips from './SelectControlsChips';

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
	statuses?: VaultState[];
	onChange: (statuses: VaultState[]) => void;
}

const VaultStatusSelector = ({ statuses = [], onChange }: Props): JSX.Element => {
	const classes = useStyles();

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		onChange(event.target.value as VaultState[]);
	};

	return (
		<TextField
			select
			size="small"
			variant="outlined"
			id="status-selector-id"
			value={statuses}
			defaultValue=""
			onChange={handleChange}
			label="Status"
			name="Status"
			color="primary"
			className={classes.formControl}
			SelectProps={{
				multiple: true,
				renderValue: (selected) => <SelectControlsChips selected={selected as string[]} />,
			}}
		>
			<MenuItem disabled value="">
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
