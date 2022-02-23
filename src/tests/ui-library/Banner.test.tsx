import React from 'react';
import { checkSnapshot } from '../utils/snapshots';
import Banner from '../../ui-library/Banner';
import { customRender, fireEvent, screen } from '../Utils';

describe('Banner', () => {
	it('renders banner information correctly', () => {
		checkSnapshot(<Banner message={'This is an important message'} onClose={() => {}} />);
	});

	it('uses correct link', () => {
		checkSnapshot(
			<Banner
				message={'This is an important message'}
				link="https://badger.com"
				linkText="view more"
				onClose={() => {}}
			/>,
		);
	});

	it('can trigger default close action', () => {
		const closeMock = jest.fn();
		customRender(
			<Banner
				message={'This is an important message'}
				link="https://badger.com"
				linkText="view more"
				onClose={closeMock}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'close banner' }));
		expect(closeMock).toHaveBeenCalledTimes(1);
	});

	it('can trigger custom close action', () => {
		const closeMock = jest.fn();
		customRender(
			<Banner
				message={'This is an important message'}
				link="https://badger.com"
				linkText="view more"
				action="dismiss"
				onClose={closeMock}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'dismiss', exact: false }));
		expect(closeMock).toHaveBeenCalledTimes(1);
	});
});
