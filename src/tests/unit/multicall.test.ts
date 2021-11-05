import { parseCallReturnContext } from '../../mobx/utils/multicall';

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
});
