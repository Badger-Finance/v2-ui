import '@testing-library/jest-dom';

import PageHeader from '../components-v2/common/PageHeader';
import React from 'react';
import { StoreProvider } from '../mobx/store-context';
import { customRender } from './Utils';
import store from '../mobx/store';

test('Renders correctly', () => {
	const title = 'Test title';
	const subtitle = 'Test subtitle';
	const { container } = customRender(
		<StoreProvider value={store}>
			<PageHeader title={title} subtitle={subtitle} />
		</StoreProvider>,
	);
	expect(container).toMatchSnapshot();
});
