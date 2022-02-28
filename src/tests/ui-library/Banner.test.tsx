import React from 'react';
import { checkSnapshot } from '../utils/snapshots';
import Banner from '../../ui-library/Banner';
import { customRender, fireEvent, screen } from '../Utils';
import BannerCloseActionButton from '../../ui-library/BannerCloseActionButton';

describe('Banner', () => {
	it('renders banner information correctly', () => {
		checkSnapshot(<Banner message={'This is an important message'} />);
	});

	it('uses correct link', () => {
		checkSnapshot(
			<Banner message={'This is an important message'} link="https://badger.com" linkText="view more" />,
		);
	});

	it('can trigger close action', () => {
		const closeMock = jest.fn();
		customRender(
			<Banner
				message={'This is an important message'}
				link="https://badger.com"
				linkText="view more"
				closeElement={<BannerCloseActionButton text="dismiss" onClose={closeMock} />}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'dismiss', exact: false }));
		expect(closeMock).toHaveBeenCalledTimes(1);
	});
});
