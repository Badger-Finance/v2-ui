import React from 'react';
import { Checkbox, ListItemText, makeStyles, MenuItem, TextField } from '@material-ui/core';
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
		<TextField
			select
			size="small"
			variant="outlined"
			value={rewards}
			defaultValue=""
			onChange={handleChange}
			id="rewards-selector-id"
			label="Rewards"
			color="primary"
			className={classes.formControl}
			SelectProps={{
				multiple: true,
				renderValue: (selected) => (selected as string[]).join(', '),
			}}
			inputProps={{ 'data-testid': 'rewards-selector-input' }}
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
		</TextField>
	);
};

export default VaultsRewardsSelector;
