import React from 'react';
import PageHeader from '../components-v2/common/PageHeader';
import store from '../mobx/store';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import { customRender } from './Utils';

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
