import React from 'react';
import store from '../mobx/RootStore';
import GovernancePortal from '../../src/pages/GovernancePortal';
import { checkSnapshot } from './utils/snapshots';
import { action } from 'mobx';

describe('Governance Portal', () => {
	beforeEach(() => {
		store.governancePortal.loadData = action(jest.fn());
		store.governancePortal.adminAddress = '0xB65cef03b9B89f99517643226d76e286ee999e77';
		store.governancePortal.contractAddress = '0x21CF9b77F88Adf8F8C98d7E33Fe601DC57bC0893';
		store.governancePortal.guardianAddress = '0x576cD258835C529B54722F84Bb7d4170aA932C64';
		store.governancePortal.timelockEvents = [
			{
				blockNumber: 12270941,
				returnValues: {
					signature: 'upgrade(address,address)',
					data:
						'0x0000000000000000000000006def55d2e18486b9ddfaa075bc4e4ee0b28c15450000000000000000000000005c7adb3fd0df2d1822a36922dd941e16d2bf4e51',
				},
				event: 'QueueTransaction',
				functionName: 'upgrade',
				parameterTypes: ['address', 'address'],
				decodedParameters: {
					'0': '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545',
					'1': '0x5c7AdB3Fd0DF2D1822a36922dd941e16D2bF4E51',
				},
			},
		];
	});

	it('renders correctly', () => {
		checkSnapshot(<GovernancePortal />);
	});
});
