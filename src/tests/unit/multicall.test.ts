import { getChainMulticallContract, parseCallReturnContext } from '../../mobx/utils/multicall';
import { Network } from '@badger-dao/sdk/lib/config/enums/network.enum';

const sampleResult = [
	{
		returnValues: [
			{
				type: 'BigNumber',
				hex: '0x00',
			},
		],
		decoded: true,
		reference: 'sett',
		methodName: 'balanceOf',
		methodParameters: ['0xc26202cd0428276cc69017df01137161f0102e55'],
		success: true,
	},
	{
		returnValues: [
			{
				type: 'BigNumber',
				hex: '0x00',
			},
		],
		decoded: true,
		reference: 'sett',
		methodName: 'available',
		methodParameters: [],
		success: true,
	},
	{
		returnValues: [
			{
				type: 'BigNumber',
				hex: '0x61858372',
			},
			{
				type: 'BigNumber',
				hex: '0x0ddc6a2646e32400',
			},
		],
		decoded: true,
		reference: 'providerReports',
		methodName: 'providerReports',
		methodParameters: ['0xB572f69edbfC946af11a1b3ef8D5c2f41D38a642', 0],
		success: true,
	},
	{
		returnValues: [
			{
				type: 'BigNumber',
				hex: '0x61843188',
			},
			{
				type: 'BigNumber',
				hex: '0x0e0973de50fbcc00',
			},
		],
		decoded: true,
		reference: 'providerReports',
		methodName: 'providerReports',
		methodParameters: ['0xB572f69edbfC946af11a1b3ef8D5c2f41D38a642', 1],
		success: true,
	},
	{
		returnValues: [
			{
				type: 'BigNumber',
				hex: '0x61858372',
			},
			{
				type: 'BigNumber',
				hex: '0x0ddc6a2646e32400',
			},
		],
		decoded: true,
		reference: 'providerReports',
		methodName: 'providerReports',
		methodParameters: ['0xB572f69edbfC946af11a1b3ef8D5c2f41D38a642', 2],
		success: true,
	},
];

describe('Multicall utils', () => {
	test('parseCallReturnContext', () => {
		expect(parseCallReturnContext(sampleResult)).toEqual({
			balanceOf: [
				[
					{
						type: 'BigNumber',
						hex: '0x00',
					},
				],
			],
			available: [
				[
					{
						type: 'BigNumber',
						hex: '0x00',
					},
				],
			],
			providerReports: [
				[
					{
						type: 'BigNumber',
						hex: '0x61858372',
					},
					{
						type: 'BigNumber',
						hex: '0x0ddc6a2646e32400',
					},
				],
				[
					{
						type: 'BigNumber',
						hex: '0x61843188',
					},
					{
						type: 'BigNumber',
						hex: '0x0e0973de50fbcc00',
					},
				],
				[
					{
						type: 'BigNumber',
						hex: '0x61858372',
					},
					{
						type: 'BigNumber',
						hex: '0x0ddc6a2646e32400',
					},
				],
			],
		});
	});

	describe('getChainMulticallContract', () => {
		test.each([
			[Network.Ethereum, '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696'],
			[Network.Polygon, '0x275617327c958bD06b5D6b871E7f491D76113dd8'],
			[Network.BinanceSmartChain, '0xC50F4c1E81c873B2204D7eFf7069Ffec6Fbe136D'],
			[Network.Arbitrum, '0x80C7DD17B01855a6D2347444a0FCC36136a314de'],
			[Network.Avalanche, '0xed386Fe855C1EFf2f843B910923Dd8846E45C5A4'],
			[Network.xDai, '0x2325b72990D81892E0e09cdE5C80DD221F147F8B'],
			[Network.Fantom, '0xd98e3dbe5950ca8ce5a4b59630a5652110403e5c'],
		])('multicall contract for %s is %s', (network, address) => {
			expect(getChainMulticallContract(network)).toEqual(address);
		});
	});
});
