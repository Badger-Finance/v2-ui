export type Performance = {
	oneDay: number;
	threeDay: number;
	sevenDay: number;
	thirtyDay: number;
};

export function scalePerformance(performance: Performance, scalar: number): Performance {
	return {
		oneDay: performance.oneDay * scalar,
		threeDay: performance.threeDay * scalar,
		sevenDay: performance.sevenDay * scalar,
		thirtyDay: performance.thirtyDay * scalar,
	};
}
