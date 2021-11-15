import { extractBalanceRequestResults } from '../../mobx/utils/user-balances';
import { ContractCallResults } from 'ethereum-multicall';
import { BalanceNamespace } from '../../web3/config/namespaces';

const mockedCorrectResults: ContractCallResults = {
	results: {
		'0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B': {
			originalContractCallContext: {
				reference: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
				contractAddress: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
				abi: [], //empty on purpose, we're not using the abi and they take lots of space
				calls: [{ reference: 'balanceOf', methodName: 'balanceOf', methodParameters: ['0x00'] }],
				context: {
					namespace: BalanceNamespace.Token,
				},
			},
			callsReturnContext: [
				{
					returnValues: [{ amounts: '0x00' }],
					decoded: true,
					reference: 'balanceOf',
					methodName: 'balanceOf',
					methodParameters: ['0x00'],
					success: true,
				},
			],
		},
		'0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D3B': {
			originalContractCallContext: {
				reference: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D3B',
				contractAddress: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
				abi: [], //empty on purpose, we're not using the abi and they take lots of space
				calls: [{ reference: 'balanceOf', methodName: 'balanceOf', methodParameters: ['0x00'] }],
				context: {
					namespace: BalanceNamespace.Sett,
				},
			},
			callsReturnContext: [
				{
					returnValues: [{ amounts: '0x00' }],
					decoded: true,
					reference: 'balanceOf',
					methodName: 'balanceOf',
					methodParameters: ['0x00'],
					success: true,
				},
			],
		},
		'0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D4B': {
			originalContractCallContext: {
				reference: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D4B',
				contractAddress: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D4B',
				abi: [], //empty on purpose, we're not using the abi and they take lots of space
				calls: [{ reference: 'balanceOf', methodName: 'balanceOf', methodParameters: ['0x00'] }],
				context: {
					namespace: BalanceNamespace.GuardedSett,
				},
			},
			callsReturnContext: [
				{
					returnValues: [{ amounts: '0x00' }],
					decoded: true,
					reference: 'balanceOf',
					methodName: 'balanceOf',
					methodParameters: ['0x00'],
					success: true,
				},
			],
		},
		'0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D5B': {
			originalContractCallContext: {
				reference: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D5B',
				contractAddress: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D5B',
				abi: [], //empty on purpose, we're not using the abi and they take lots of space
				calls: [{ reference: 'balanceOf', methodName: 'balanceOf', methodParameters: ['0x00'] }],
				context: {
					namespace: BalanceNamespace.Deprecated,
				},
			},
			callsReturnContext: [
				{
					returnValues: [{ amounts: '0x00' }],
					decoded: true,
					reference: 'balanceOf',
					methodName: 'balanceOf',
					methodParameters: ['0x00'],
					success: true,
				},
			],
		},
		'0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D6B': {
			originalContractCallContext: {
				reference: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D6B',
				contractAddress: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D6B',
				abi: [], //empty on purpose, we're not using the abi and they take lots of space
				calls: [{ reference: 'balanceOf', methodName: 'balanceOf', methodParameters: ['0x00'] }],
				context: {
					namespace: BalanceNamespace.Deprecated,
				},
			},
			callsReturnContext: [
				{
					returnValues: [{ amounts: '0x00' }],
					decoded: true,
					reference: 'balanceOf',
					methodName: 'balanceOf',
					methodParameters: ['0x00'],
					success: true,
				},
			],
		},
	},
	blockNumber: 0,
};

const mockedBadResults: ContractCallResults = {
	results: {
		'0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B': {
			originalContractCallContext: {
				reference: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
				contractAddress: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
				abi: [], //empty on purpose, we're not using the abi and they take lots of space
				calls: [{ reference: 'balanceOf', methodName: 'balanceOf', methodParameters: ['0x00'] }],
				context: {
					namespace: 'foo',
				},
			},
			callsReturnContext: [
				{
					returnValues: [{ amounts: '0x00' }],
					decoded: true,
					reference: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
					methodName: 'foo',
					methodParameters: [42],
					success: true,
				},
			],
		},
	},
	blockNumber: 0,
};

describe('User balances utils', () => {
	describe('extractBalanceRequestResults', () => {
		it('extract results correctly', () => {
			const keys = extractBalanceRequestResults(mockedCorrectResults);
			expect(keys).toMatchSnapshot();
		});

		it('error logs invalid namespaces', () => {
			const mockedError = jest.fn();
			console.error = mockedError;
			extractBalanceRequestResults(mockedBadResults);
			expect(mockedError).toHaveBeenCalled();
		});
	});
});
