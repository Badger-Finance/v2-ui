import React from 'react';
import PageHeader from '../PageHeader';
import store from '../../../mobx/store';
import '@testing-library/jest-dom';
import { StoreProvider } from 'mobx/store-context';
import { render } from '@testing-library/react';

test('Renders correctly', () => {
	const title = 'Test title';
	const subtitle = 'Test subtitle';
	const { container } = render(
		<StoreProvider value={store}>
			<PageHeader title={title} subtitle={subtitle} />
		</StoreProvider>,
	);
	expect(container).toMatchSnapshot();
});
