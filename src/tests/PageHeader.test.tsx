import '@testing-library/jest-dom';

import React from 'react';

import PageHeader from '../components-v2/common/PageHeader';
import { checkSnapshot } from './utils/snapshots';

test('Renders correctly', () => {
	const title = 'Test title';
	const subtitle = 'Test subtitle';
	checkSnapshot(<PageHeader title={title} subtitle={subtitle} />);
});
