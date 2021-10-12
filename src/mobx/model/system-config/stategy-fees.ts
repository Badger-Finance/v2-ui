export enum StrategyFee {
	performance = 'performance',
	strategistPerformance = 'strategistPerformance',
	withdraw = 'withdraw',
	yearnPerformance = 'yearnPerformance',
	yearnManagement = 'yearnManagement',
	harvestPerformance = 'harvestPerformance',
	harvestStrategistPerformance = 'harvestStrategistPerformance',
}

export const userReadableFeeNames: Record<StrategyFee, string> = {
	[StrategyFee.performance]: 'Performance Fee',
	[StrategyFee.strategistPerformance]: 'Strategist Performance Fee',
	[StrategyFee.withdraw]: 'Withdraw Fee',
	[StrategyFee.yearnPerformance]: 'Yearn Performance Fee',
	[StrategyFee.yearnManagement]: 'Yearn Management Fee',
	[StrategyFee.harvestPerformance]: 'Harvest Performance Fee',
	[StrategyFee.harvestStrategistPerformance]: 'Harvest Strategist Performance Fee',
};
