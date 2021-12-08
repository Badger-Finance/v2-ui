import 'jest';
import { getFormattedNetworkName, restrictToRange, roundWithDecimals } from '../../utils/componentHelpers';
import { Ethereum } from '../../mobx/model/network/eth.network';
import { BinanceSmartChain } from '../../mobx/model/network/bsc.network';
import { Arbitrum } from '../../mobx/model/network/arbitrum.network';
import { Polygon } from '../../mobx/model/network/matic.network';

describe('Component Helpers', () => {
	describe('restrictToRange', () => {
		test.each([
			[100, 10, 20, 20],
			[Infinity, 1231, 20222, 20222],
			[0, 100, 210, 100],
			[-Infinity, 0, 100, 0],
		])('restrictToRange(%f,%f,%f) returns %f', (val, min, max, restiricetedValue) => {
			expect(restrictToRange(val, min, max)).toEqual(restiricetedValue);
		});
	});

	describe('roundWithDecimals', () => {
		test.each([
			[12.1322, 1, 12.1],
			[100.123121, 2, 100.12],
			[81.6712, 3, 81.671],
		])('roundWithDecimals(%f,%f,%f) returns %f', (num, decimals, roundedValue) => {
			expect(roundWithDecimals(num, decimals)).toEqual(roundedValue);
		});
	});

	describe('getFormattedNetworkName', () => {
		test.each([
			[new Ethereum(), 'Ethereum'],
			[new BinanceSmartChain(), 'Binance Smart Chain'],
			[new Arbitrum(), 'Arbitrum'],
			[new Polygon(), 'Polygon'],
		])('getFormattedNetworkName(%s) returns %s', (network, networkName) => {
			expect(getFormattedNetworkName(network)).toEqual(networkName);
		});
	});
});
