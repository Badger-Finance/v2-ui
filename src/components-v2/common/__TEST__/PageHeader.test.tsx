import React from 'react';
import renderer from 'react-test-renderer';
import PageHeader from '../PageHeader';
import store from '../../../mobx/store';
import '@testing-library/jest-dom';
import { StoreProvider } from 'mobx/store-context';

test('Renders correctly', () => {
	const title = 'Test title';
	const subtitle = 'Test subtitle';
	const rendered = renderer
		.create(
			<StoreProvider value={store}>
				<PageHeader title={title} subtitle={subtitle} />
			</StoreProvider>,
		)
		.toJSON();
	expect(rendered).toMatchSnapshot();
});
