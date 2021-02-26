import React from 'react';
import { render, screen } from '@testing-library/react';
import PageHeader from '../PageHeader';
import store from '../../../mobx/store';
import '@testing-library/jest-dom';
import { StoreProvider } from 'mobx/store-context';

test('Renders with correct title and subtitle', () => {
	const title = 'Test title';
	const subtitle = 'Test subtitle';
	render(
		<StoreProvider value={store}>
			<PageHeader title={title} subtitle={subtitle} />
		</StoreProvider>,
	);
	expect(screen.getByText(title)).toBeInTheDocument();
	expect(screen.getByText(subtitle)).toBeInTheDocument();
});
