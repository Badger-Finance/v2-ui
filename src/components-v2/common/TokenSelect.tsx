import React from 'react';
import { FormControl, InputBase, makeStyles, MenuItem, Select } from '@material-ui/core';

interface Props {
	selectedOption?: string;
	placeholder?: string;
	options?: Map<string, string>;
	disabled?: boolean;
	onChange: (option: string) => void;
}

const useStyles = makeStyles((theme) => ({
	margin: {
		margin: theme.spacing(1),
	},
}));

/**
 * Displays a list of tokens that can be selected
 * @param selectedOption option that's currently selected
 * @param placeholder placeholder to display
 * @param options token options to be displayed, they need to have the [address: string] => [name: string] format
 * @param disabled prevents the list from being interacted with
 * @param onChange function that handles token selection
 */
export const TokenSelect = ({
	selectedOption = '',
	placeholder = 'Select',
	options = new Map<string, string>(),
	disabled = false,
	onChange,
}: Props) => {
	const classes = useStyles();

	const handleOptionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		onChange(event.target.value as string);
	};

	return (
		<FormControl className={classes.margin}>
			<Select
				autoWidth
				displayEmpty
				value={selectedOption}
				onChange={handleOptionChange}
				disabled={disabled}
				input={<InputBase color="primary" placeholder={placeholder} disabled={disabled} />}
			>
				<MenuItem value="" disabled>
					{placeholder}
				</MenuItem>
				{Array.from(options).map(([key, value]) => (
					<MenuItem key={`${key}_${value}`} value={key}>
						{value}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};
