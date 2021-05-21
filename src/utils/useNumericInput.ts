import { SetStateAction, ChangeEvent } from 'react';

/**
 * Functions that will be triggered on valid changes
 */
type ChangeHandler = (change: string) => void | SetStateAction<string>;

/**
 * Props needed to implement numeric validation on inputs
 * @property type - the type that input should have
 * @property pattern - the pattern that the input should have
 * @property onValidChange - a function to register a handler function to execute upon successful validation
 */
interface NumericInputProps {
	type: string;
	pattern: string;
	onValidChange: (onChange: ChangeHandler) => (event: ChangeEvent<{ value: unknown }>) => void;
}

function isValidChange(input: string): boolean {
	// matches one or many digits followed by an optional single "." appearance that's followed by one or more digits
	const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
	// remove any non-numeric invalid characters
	const cleanInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return inputRegex.test(cleanInput);
}

/**
 * Utility hook that returns in a headless fashion all the props required to have an input with numeric validation.
 * @return {NumericInputProps} input props
 */
export const useNumericInput = (): NumericInputProps => {
	const onValidChange = (onChange: ChangeHandler) => (event: ChangeEvent<{ value: unknown }>) => {
		// replace commas with periods
		const input = (event.target.value as string).replace(/,/g, '.');

		if (input === '' || isValidChange(input)) {
			onChange(input);
		}
	};

	return {
		type: 'tel',
		pattern: "'^[0-9]*[.,]?[0-9]*$'",
		onValidChange,
	};
};
