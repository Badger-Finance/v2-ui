interface InitialInformation {
	initialFee: string;
	initialConversionRate: string;
}

export const useInitialInformation = (feeRate: string, conversionRate: string): InitialInformation => {
	return {
		initialFee: Math.max(1 - parseFloat(feeRate), 0).toFixed(3),
		initialConversionRate: parseFloat(conversionRate).toFixed(4),
	};
};
