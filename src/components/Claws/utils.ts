export const isValidAmountChange = (input: string) => {
	const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
	const cleanInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return inputRegex.test(cleanInput);
};

export const sanitizeValue = (value: string) => {
	const isNonCalculableValue = ['', '.'].includes(value) || +value < 0;
	return isNonCalculableValue ? '' : value;
};
