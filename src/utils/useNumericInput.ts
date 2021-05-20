import { ChangeEvent, SetStateAction } from 'react';

/**
 * Props needed to implement numeric validation on inputs
 * @property type - the type that input should have
 * @property pattern - the pattern that the input should have
 * @property onChange - onChange function that will be triggered after validation
 */
interface NumericInputProps {
	type: string;
	pattern: string;
	onChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

function isValidChange(input: string): boolean {
	// matches one or many digits followed by an optional single "." appearance that's followed by one or more digits
	const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
	// remove any non-numeric invalid characters
	const cleanInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return inputRegex.test(cleanInput);
}

/**
 * Utility hook that returns in a headless fashion all the props needed to have an input with numeric validation.
 * @param changeFn function that will be triggered upon valid input
 * @return {NumericInputProps} input props
 */
export const useNumericInput = (changeFn: (change: string) => void | SetStateAction<string>): NumericInputProps => {
	const onChange = (event: ChangeEvent<{ value: unknown }>) => {
		// replace commas with periods
		const input = (event.target.value as string).replace(/,/g, '.');

		if (input === '' || isValidChange(input)) {
			changeFn(input);
		}
	};

	return {
		type: 'tel',
		pattern: "'^[0-9]*[.,]?[0-9]*$'",
		onChange,
	};
};
