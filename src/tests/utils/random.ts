export const randomValue = (min?: number, max?: number): number => {
	const minValue = min || 10;
	const maxValue = max || 50000;
	const rand = minValue + Math.random() * (maxValue - minValue);
	return parseFloat(rand.toFixed(3));
};
