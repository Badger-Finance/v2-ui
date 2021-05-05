import BigNumber from 'bignumber.js';
import { batchConfig } from 'mobx/utils/web3';
import {
	ReducedCurveResult,
	ReducedContractConfig,
	MethodConfigPayload,
	GraphResultPrices,
	ReducedGraphResults,
} from '../model';
import { map, compact, keyBy, mapValues, isString } from '../../utils/lodashToNative';

export const reduceBatchResult = (result: any[]): any[] => {
	return result.map((vault) => {
		return mapValues(vault, (element: any, key: any) => {
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
	else if (isString(value) && value.slice(0, 2) === '0x') return value as string;
	else if (isString(value)) return value;
	else return value;
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
	const noDupes = reduction.filter(Boolean).map((token: any, index: number) => {
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

	return noDupes.filter(Boolean);
};

export const reduceCurveResult = (
	curveResult: any[],
	contracts: string[],
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
		};
	});
};

export const reduceContractConfig = (configs: any[], payload: any = {}): ReducedContractConfig => {
	const contracts = map(configs, (config: any | undefined) => {
		if (!config) {
			return;
		}
		return map(config.contracts, (contract: string, i: number) => {
			const r: any = {
				address: contract,
				abi: config.abi,
				methods: reduceMethodConfig(config.methods, payload),
				underlyingKey: config.underlying,
			};
			if (!!config.fillers)
				mapValues(config.fillers, (fillers: any, key: any) => {
					r[key] = fillers[i];
				});
			return r;
		});
	});
	const defaults = keyBy(contracts.flat(), 'address');
	const batchCall = map(configs, (config: any) => {
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
	const reduced = map(methods, (method: any) => {
		const args = map(method.args, (arg: string) => {
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
		if (args.length > compact(args).length) {
			return false;
		}

		return {
			name: method.name,
			...(args.length > 0 && { args: args }),
		};
	});

	return compact(reduced);
};
