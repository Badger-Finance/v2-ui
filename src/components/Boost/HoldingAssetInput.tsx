import React, { ChangeEvent } from 'react';
import { Button, TextField, TextFieldProps } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { makeStyles } from '@material-ui/core/styles';

const useInputStyles = makeStyles((theme) => ({
	input: {
		padding: '8px 4px',
		fontSize: 20,
		textAlign: 'center',
		[theme.breakpoints.down(500)]: {
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
		width: 32,
		height: 28,
		minWidth: 32,
	},
	actionImage: {
		width: 12,
		[theme.breakpoints.down(500)]: {
			width: 16,
		},
	},
}));

interface CurrencyInputProps {
	inputRef: (instance: NumberFormat<any> | null) => void;
	onChange: (event: { target: { name: string; value: string } }) => void;
	name: string;
}

const CurrencyInput = (props: CurrencyInputProps): JSX.Element => {
	const { inputRef, onChange, ...other } = props;

	// this will be updated through onValueChange
	let nonFormattedValue: string;

	return (
		<NumberFormat
			{...other}
			getInputRef={inputRef}
			// gets executed before the onChange event
			onValueChange={(values, _) => {
				nonFormattedValue = values.value;
			}}
			// we use this handler instead of the onValueChange to make sure the onChange in props gets executed
			// only on manual input changes
			onChange={(event: ChangeEvent<HTMLInputElement>) => {
				onChange({
					target: {
						name: event.target.name,
						value: nonFormattedValue,
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
	increaseAlt?: string;
	decreaseAlt?: string;
	onChange: (change: string) => void;
	onIncrement: () => void;
	onReduction: () => void;
}

export const HoldingAssetInput = ({
	increaseAlt,
	decreaseAlt,
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
			InputProps={{
				...InputProps,
				startAdornment: (
					<Button className={buttonClasses.actionButton} onClick={onReduction}>
						<img
							className={buttonClasses.actionImage}
							src="/assets/icons/boost-down.svg"
							alt={decreaseAlt}
						/>
					</Button>
				),
				endAdornment: (
					<Button className={buttonClasses.actionButton} onClick={onIncrement}>
						<img className={buttonClasses.actionImage} src="/assets/icons/boost-up.svg" alt={increaseAlt} />
					</Button>
				),
				classes: inputClasses,
				// the "any" is because of the onChange type handler
				inputComponent: CurrencyInput as any,
			}}
			variant="outlined"
		/>
	);
};
