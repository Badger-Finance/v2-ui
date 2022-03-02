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
			[Network.Ethereum],
			[Network.Polygon],
			[Network.BinanceSmartChain],
			[Network.Arbitrum],
			[Network.Avalanche],
			[Network.xDai],
			[Network.Fantom],
		])('multicall contract for %p', (network) => {
			expect(getChainMulticallContract(network)).toMatchSnapshot();
		});
	});
});
