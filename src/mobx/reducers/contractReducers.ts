import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { NETWORK_CONSTANTS, NETWORK_LIST } from 'config/constants';
import deploy from 'config/deployments/mainnet.json';
import { batchConfig } from 'mobx/utils/web3';
import { RootStore } from 'mobx/store';
import { growthQuery, secondsToBlocks } from 'mobx/utils/helpers';
import {
	ReducedSushiROIResults,
	ReducedGrowthQueryConfig,
	ReducedCurveResult,
	ReducedGrowth,
	Growth,
	ReducedContractConfig,
	MethodConfigPayload,
	SushiAPIResults,
	GraphResultPrices,
	ReducedGraphResults,
	Schedules,
} from '../model';

export const reduceBatchResult = (result: any[]): any[] => {
	return result.map((vault) => {
		return _.mapValues(vault, (element: any, key: any) => {
			if (key === 'getUnlockSchedulesFor') {
				// handle special case for multiple values
				const newElement: any = {};
				element.forEach((e: any) => {
					newElement[e.args[0]] = e.value;
				});
				return newElement;
			}
			if (key === 'decimals') {
				return Array.isArray(element) ? parseInt(element[0].value) : parseInt(element);
			}
			return Array.isArray(element) ? reduceResult(element[0].value) : reduceResult(element);
		});
	});
};

// Disable Reason: value is assigned from results of a web3-batch-call that can take different shapes.
// Function deals with type identification for the differnet possible cases.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const reduceResult = (value: any): any => {
	if (/^-?\d+$/.test(value)) return new BigNumber(value);
	else if (_.isString(value) && value.slice(0, 2) === '0x') return value as string;
	else if (_.isString(value)) return value;
	else return value;
};

export const reduceSushiAPIResults = (results: SushiAPIResults): any => {
	const newSushiROIs: any = _.map(results.pairs, (pair: any) => {
		return {
			address: pair.address,
			day: new BigNumber(pair.aprDay).dividedBy(100),
			week: new BigNumber(pair.aprDay).dividedBy(100).multipliedBy(7),
			month: new BigNumber(pair.aprMonthly).dividedBy(100),
			year: new BigNumber(pair.aprYear_without_lockup).dividedBy(100),
		};
	});
	return _.keyBy(newSushiROIs, 'address');
};

export const reduceXSushiROIResults = (ROI: number | string | BigNumber): ReducedSushiROIResults => {
	return {
		day: new BigNumber(ROI).dividedBy(365),
		week: new BigNumber(ROI).dividedBy(365).multipliedBy(7),
		month: new BigNumber(ROI).dividedBy(12),
		year: new BigNumber(ROI),
	};
};

export const reduceGrowthQueryConfig = (networkName: string, currentBlock?: number): ReducedGrowthQueryConfig => {
	if (!currentBlock) return { periods: [], growthQueries: [] };

	const periods = [
		Math.max(currentBlock - Math.floor(secondsToBlocks(60 * 5)), NETWORK_CONSTANTS[networkName].START_BLOCK), // 5 minutes ago
		Math.max(
			currentBlock - Math.floor(secondsToBlocks(1 * 24 * 60 * 60)),
			NETWORK_CONSTANTS[networkName].START_BLOCK,
		), // day
		Math.max(
			currentBlock - Math.floor(secondsToBlocks(7 * 24 * 60 * 60)),
			NETWORK_CONSTANTS[networkName].START_BLOCK,
		), // week
		Math.max(
			currentBlock - Math.floor(secondsToBlocks(30 * 24 * 60 * 60)),
			NETWORK_CONSTANTS[networkName].START_BLOCK,
		), // month
		NETWORK_CONSTANTS[networkName].START_BLOCK, // start
	];

	return { periods, growthQueries: periods.map(growthQuery) };
};

export const reduceGraphResult = (graphResult: any[], prices: GraphResultPrices): ReducedGraphResults[] => {
	const reduction = graphResult.map((element: any) => {
		if (!element.data.pair && !element.data.token) return;

		// calculate price per token
		let ethValue;

		if (!!element.data.pair) {
			// compilation any, until price resolution is stanardized
			let token0Value: any = prices[element.data.pair.token0.id];
			let token1Value: any = prices[element.data.pair.token1.id];

			// assign eth value
			if (token0Value) token0Value = token0Value.ethValue / 1e18;
			if (token1Value) token1Value = token1Value.ethValue / 1e18;

			// fall back to derived ETH from thegraph
			if (!token0Value) token0Value = new BigNumber(element.data.pair.token0.derivedETH);
			if (!token1Value) token1Value = new BigNumber(element.data.pair.token1.derivedETH);

			const reserve0 = new BigNumber(token0Value)
				.multipliedBy(new BigNumber(element.data.pair.reserve0))
				.multipliedBy(1e18);
			const reserve1 = new BigNumber(token1Value)
				.multipliedBy(new BigNumber(element.data.pair.reserve1))
				.multipliedBy(1e18);

			ethValue = reserve0.plus(reserve1).dividedBy(element.data.pair.totalSupply);
		} else {
			ethValue = new BigNumber(element.data.token.derivedETH).multipliedBy(1e18);
		}

		const tokenAddress = !!element.data.pair ? element.data.pair.id : element.data.token.id;

		return {
			address: tokenAddress,
			type: !!element.data.pair ? 'pair' : 'token',
			name: !!element.data.pair
				? element.data.pair.token0.name + '/' + element.data.pair.token1.name
				: element.data.token.name,
			ethValue: ethValue,
		};
	});

	// average duplicates
	const noDupes = _.compact(reduction).map((token: any, index: number) => {
		graphResult.forEach((duplicate: any, dupIndex: number) => {
			if (dupIndex > index && duplicate.address === token.address) {
				if (duplicate.ethValue.gt(0)) {
					token.ethValue = token.ethValue.plus(duplicate.ethValue).dividedBy(2);
				} else if (duplicate.address === token.address) {
					token = undefined;
				}
			}
		});
		return token;
	});

	return _.compact(noDupes);
};

export const reduceCurveResult = (
	curveResult: any[],
	contracts: string[],
	//_tokenContracts: any, // It is unused for now but may be used in the future
	wbtcToken: ReducedGraphResults,
): ReducedCurveResult => {
	return curveResult.map((result: any, i: number) => {
		let sum = new BigNumber(0);
		let count = 0;
		result.map((sample: any, i: number) => {
			sum = sum.plus(sample.virtual_price);
			count++;
			if (i > 10) return;
		});

		const vp = sum.dividedBy(count).dividedBy(1e18);

		return {
			address: contracts[i],
			virtualPrice: vp,
			ethValue: new BigNumber(vp).multipliedBy(wbtcToken.ethValue),
			// balance: tokenContracts[contracts[i]].balance
		};
	});
};

export const reduceGrowth = (graphResult: any[], periods: number[], startDate: Date): ReducedGrowth => {
	const reduction: any[] = graphResult.map((result: any) => !!result.data && _.keyBy(result.data.vaults, 'id'));

	return _.mapValues(reduction[0], (value: any, key: string) => {
		const timePeriods = ['now', 'day', 'week', 'month', 'start'];

		const growth: any = {};
		reduction.forEach((vault: any, i: number) => {
			// added catch for incorrect PPFS reporting
			if (key.toLowerCase() === '0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87'.toLowerCase()) {
				growth[timePeriods[i]] = !!vault[key]
					? parseFloat(vault[key].pricePerFullShare) >= 1.05
						? new BigNumber('1')
						: new BigNumber(vault[key].pricePerFullShare)
					: new BigNumber('1');
			} else {
				growth[timePeriods[i]] = !!vault[key]
					? new BigNumber(vault[key].pricePerFullShare)
					: new BigNumber('1');
			}
		});

		const day = growth.now.dividedBy(growth.day).minus(1);
		const week = growth.week.gt(1) ? growth.now.dividedBy(growth.week).minus(1) : day.multipliedBy(7);
		const month = growth.month.gt(1) ? growth.now.dividedBy(growth.month).minus(1) : week.multipliedBy(4);
		const year = growth.start.gt(1)
			? growth.now
					.dividedBy(growth.start)
					.minus(1)
					.dividedBy(new Date().getTime() - startDate.getTime())
					.multipliedBy(365 * 24 * 60 * 60 * 60)
			: month.multipliedBy(13.05);

		return { day, week, month, year };
	});
};

export const reduceGeyserSchedule = (schedules: Schedules, store: RootStore): Growth[] => {
	// console.log(JSON.stringify(schedules))
	// console.log(_.keysIn(schedules))
	// console.log(schedules);

	return _.compact(
		_.map(schedules, (schedule: any[], tokenAddress: string) => {
			let locked = new BigNumber(0);
			const timestamp = new BigNumber(new Date().getTime() / 1000.0);
			const period = { start: timestamp, end: timestamp };

			let lockedAllTime = new BigNumber(0);
			const periodAllTime = { start: timestamp, end: timestamp };

			// console.log(schedule)

			schedule.forEach((block: any) => {
				const [initial, endAtSec, , startTime] = _.valuesIn(block).map((val: any) => new BigNumber(val));
				let initialLocked = initial;
				if (tokenAddress.toLowerCase() === deploy.digg_system.uFragments.toLowerCase()) {
					initialLocked = initialLocked.dividedBy(
						28948022309329048855892746252171976963317496166410141009864396001,
					);
				}

				if (timestamp.gt(startTime) && timestamp.lt(endAtSec)) {
					locked = locked.plus(initialLocked);
					if (startTime.lt(period.start)) period.start = startTime;
					if (endAtSec.gt(period.end)) period.end = endAtSec;
				}

				lockedAllTime = lockedAllTime.plus(initialLocked);
				if (startTime.lt(periodAllTime.start)) periodAllTime.start = startTime;
				if (endAtSec.gt(periodAllTime.end)) periodAllTime.end = endAtSec;
			});

			const duration = period.end.minus(period.start);
			let rps = locked.dividedBy(duration.isNaN() ? 1 : duration);
			const rpsAllTime = lockedAllTime.dividedBy(periodAllTime.end.minus(periodAllTime.start));

			if (!rps || rps.eq(0)) rps = rpsAllTime.dividedBy(365 * 60 * 60 * 24);

			const periods = {
				day: rps.multipliedBy(60 * 60 * 24),
				week: rps.multipliedBy(60 * 60 * 24 * 7),
				month: rps.multipliedBy(60 * 60 * 24 * 30),
				year: rpsAllTime.multipliedBy(60 * 60 * 24 * 365),
			};
			return _.mapValues(periods, (amount: BigNumber) => ({
				amount: amount,
				token: store.contracts.tokens[tokenAddress],
			}));
		}),
	);
};

export const reduceContractConfig = (configs: any[], payload: any = {}): ReducedContractConfig => {
	const contracts = _.map(configs, (config: any | undefined) => {
		if (!config) {
			return;
		}
		return _.map(config.contracts, (contract: string, i: number) => {
			const r: any = {
				address: contract,
				abi: config.abi,
				methods: reduceMethodConfig(config.methods, payload),
				underlyingKey: config.underlying,
			};
			if (!!config.fillers)
				_.mapValues(config.fillers, (fillers: any, key: any) => {
					r[key] = fillers[i];
				});
			return r;
		});
	});
	const defaults = _.keyBy(_.flatten(contracts), 'address');
	const batchCall = _.map(configs, (config: any) => {
		return batchConfig(
			'namespace',
			config.contracts,
			!!config.methods ? reduceMethodConfig(config.methods, payload) : [],
			config.abi,
		);
	});
	return { defaults, batchCall };
};

export const reduceMethodConfig = (methods: any[], payload: MethodConfigPayload): { args?: any[]; name: any }[] => {
	const reduced = _.map(methods, (method: any) => {
		const args = _.map(method.args, (arg: string) => {
			const brackets = /\{(.*?)\}/; // FIXME: has a redundant escape character for \{ and \}
			const matches = brackets.exec(arg);
			if (!!matches && !!payload[matches[1]]) {
				return payload[matches[1]];
			} else if (!!matches) {
				return false;
			} else {
				return arg;
			}
		});
		// assume we shouldn't call the method if payload doesn't include correct variables
		if (args.length > _.compact(args).length) {
			return false;
		}

		return {
			name: method.name,
			...(args.length > 0 && { args: args }),
		};
	});

	return _.compact(reduced);
};
