import React from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	input: {
		padding: '8px 4px',
		fontSize: 20,
		textAlign: 'center',
		[theme.breakpoints.down(500)]: {
			padding: '16px 4px',
			fontSize: 24,
		},
	},
	adornedStart: {
		paddingLeft: 4,
	},
	adornedEnd: {
		paddingRight: 4,
	},
	notchedOutline: {
		borderWidth: 2,
	},
}));

interface CurrencyInputProps {
	inputRef: (instance: NumberFormat | null) => void;
	onChange: (event: { target: { name: string; value: string } }) => void;
	name: string;
}

const CurrencyInput = (props: CurrencyInputProps): JSX.Element => {
	const { inputRef, onChange, ...other } = props;

	return (
		<NumberFormat
			{...other}
			getInputRef={inputRef}
			onValueChange={(values) => {
				onChange({
					target: {
						name: props.name,
						value: values.value,
					},
				});
			}}
			allowNegative={false}
			thousandSeparator
			isNumericString
			prefix="$"
		/>
	);
};

interface HoldingAssetProps extends Omit<TextFieldProps, 'onChange'> {
	onChange: (change: string) => void;
}

export const HoldingAssetInput = ({ onChange, InputProps, ...props }: HoldingAssetProps): JSX.Element => {
	const classes = useStyles();

	return (
		<TextField
			{...props}
			onChange={(event) => onChange(event.target.value as string)}
			// the "any" is because of the onChange type handler
			InputProps={{ ...InputProps, classes, inputComponent: CurrencyInput as any }}
			variant="outlined"
		/>
	);
};
