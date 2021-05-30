export const randomValue = (min?: number, max?: number): number => {
	const minValue = min || 10;
	const maxValue = max || 50000;
	return minValue + Math.random() * (maxValue - minValue);
};
