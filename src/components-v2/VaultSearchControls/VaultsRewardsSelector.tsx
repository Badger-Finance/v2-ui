import React from 'react';
import { makeStyles, MenuItem, TextField } from '@material-ui/core';
import { VaultBehavior } from '@badger-dao/sdk';

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
	reward?: VaultBehavior;
	onChange: (vaultBehavior: VaultBehavior) => void;
}

const VaultsRewardsSelector = ({ reward, onChange }: Props): JSX.Element => {
	const classes = useStyles();

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		onChange(event.target.value as VaultBehavior);
	};

	return (
		<TextField
			select
			size="small"
			variant="outlined"
			value={reward ?? ''}
			defaultValue=""
			onChange={handleChange}
			label="Rewards"
			color="primary"
			className={classes.formControl}
		>
			<MenuItem value="">
				<em>Rewards</em>
			</MenuItem>
			{Object.values(VaultBehavior).map((status) => (
				<MenuItem className={classes.capitalized} key={status} value={status}>
					{status}
				</MenuItem>
			))}
		</TextField>
	);
};

export default VaultsRewardsSelector;
