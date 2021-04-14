import React from 'react';
import { InputBase, makeStyles } from '@material-ui/core';

interface Props {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	onChange: (amount: string) => void;
}

const useStyles = makeStyles((theme) => ({
	input: {
		color: theme.palette.text.secondary,
		fontWeight: 'normal',
		[theme.breakpoints.only('xs')]: {
			paddingLeft: theme.spacing(1),
			paddingBottom: theme.spacing(1),
		},
	},
}));

function isValidAmountChange(input: string) {
	// matches one or many digits followed by an option single "." appearance that's followed by one or more digits
	const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
	// remove any non-numeric invalid characters
	const cleanInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return inputRegex.test(cleanInput);
}

function sanitizeValue(value: string): string {
	const isNonCalculableValue = ['', '.'].includes(value) || +value < 0;
	return isNonCalculableValue ? '' : value;
}

export const TokenAmountInput = ({
	value = '',
	placeholder = '0.00',
	disabled = false,
	onChange,
}: Props): JSX.Element => {
	const classes = useStyles();

	const handleAmountChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		const input = event.target.value as string;
		if (!isValidAmountChange(input)) return;
		onChange(sanitizeValue(input));
	};

	return (
		<InputBase
			fullWidth
			type="tel"
			value={value}
			placeholder={placeholder}
			disabled={disabled}
			inputProps={{ pattern: '^[0-9]*[.,]?[0-9]*$' }}
			className={classes.input}
			onChange={handleAmountChange}
		/>
	);
};
