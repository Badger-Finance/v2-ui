import React from 'react';
import { Button, TextField, TextFieldProps } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { makeStyles } from '@material-ui/core/styles';

const useInputStyles = makeStyles((theme) => ({
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

const useButtonStyles = makeStyles((theme) => ({
	actionButton: {
		borderRadius: 2,
		[theme.breakpoints.up(500)]: {
			width: 32,
			height: 32,
			minWidth: 32,
		},
	},
	actionImage: {
		width: 12,
		[theme.breakpoints.down(500)]: {
			width: 16,
		},
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
	onIncrement: () => void;
	onReduction: () => void;
}

export const HoldingAssetInput = ({
	onChange,
	onIncrement,
	onReduction,
	InputProps,
	...materialButtonProps
}: HoldingAssetProps): JSX.Element => {
	const inputClasses = useInputStyles();
	const buttonClasses = useButtonStyles();

	return (
		<TextField
			{...materialButtonProps}
			onChange={(event) => onChange(event.target.value as string)}
			// the "any" is because of the onChange type handler
			InputProps={{
				...InputProps,
				startAdornment: (
					<Button className={buttonClasses.actionButton} onClick={onIncrement}>
						<img
							className={buttonClasses.actionImage}
							src="/assets/icons/boost-up.svg"
							alt="increase native holdings"
						/>
					</Button>
				),
				endAdornment: (
					<Button className={buttonClasses.actionButton} onClick={onReduction}>
						<img
							className={buttonClasses.actionImage}
							src="/assets/icons/boost-down.svg"
							alt="decrease native holdings"
						/>
					</Button>
				),
				classes: inputClasses,
				inputComponent: CurrencyInput as any,
			}}
			variant="outlined"
		/>
	);
};
