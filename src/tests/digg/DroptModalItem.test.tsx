import React from 'react';
import '@testing-library/jest-dom';
import DroptModalItem from 'components/Digg/DroptModalItem';
import { customRender } from 'tests/Utils';
import { BigNumber } from 'ethers';

describe('Dropt Modal Item', () => {
	it('renders correctly', () => {
		const { container } = customRender(
			<DroptModalItem
				key="DROPT-2"
				token="DROPT-2"
				balance={BigNumber.from(1)}
				displayBalance={'0.001'}
				redemptionAmount={'0.001'}
				redemptionContract={'0x111111111111111111111111'}
			/>,
		);
		expect(container).toMatchSnapshot();
	});
});
