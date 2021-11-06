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
];

describe('Multicall utils', () => {
	test('parseCallReturnContext', () => {
		expect(parseCallReturnContext(sampleResult)).toEqual({
			balanceOf: [
				{
					type: 'BigNumber',
					hex: '0x00',
				},
			],
			available: [
				{
					type: 'BigNumber',
					hex: '0x00',
				},
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
			[Network.xDai, '0x6e5BB1a5Ad6F68A8D7D6A5e47750eC15773d6042'],
			[Network.Fantom, '0xb828c456600857abd4ed6c32facc607bd0464f4f'],
		])('multicall contract for %s is %s', (network, address) => {
			expect(getChainMulticallContract(network)).toEqual(address);
		});
	});
});
