import React from 'react';
import { Checkbox, FormControl, InputLabel, ListItemText, makeStyles, MenuItem, Select } from '@material-ui/core';
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
	rewards?: VaultBehavior[];
	onChange: (vaultBehaviors: VaultBehavior[]) => void;
}

const VaultsRewardsSelector = ({ rewards = [], onChange }: Props): JSX.Element => {
	const classes = useStyles();

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		onChange(event.target.value as VaultBehavior[]);
	};

	return (
		<FormControl variant="outlined" className={classes.formControl} color="primary">
			<InputLabel id="rewards-selector-id-label">Rewards</InputLabel>
			<Select
				multiple
				labelId="rewards-selector-id-label"
				id="rewards-selector"
				value={rewards}
				onChange={handleChange}
				label="Rewards"
				inputProps={{ 'data-testid': 'rewards-selector-input' }}
				renderValue={(selected) => (selected as string[]).join(',  ')}
			>
				<MenuItem disabled value="">
					<em>Rewards</em>
				</MenuItem>
				{Object.values(VaultBehavior).map((reward) => (
					<MenuItem className={classes.capitalized} key={reward} value={reward}>
						<Checkbox color="primary" checked={rewards.indexOf(reward) > -1} />
						<ListItemText primary={reward} />
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

export default VaultsRewardsSelector;
