import React from 'react';
import { Badge, BadgeType } from '../../ui-library/Badge';
import { customRender } from '../Utils';

const testCases = Object.values(BadgeType).map((type) => [type]);

describe('Badge', () => {
	test.each([...testCases])('renders for type %s', (type) => {
		const { container } = customRender(<Badge type={type} />);
		expect(container).toMatchSnapshot();
	});
});
