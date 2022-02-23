import React from 'react';
import NotificationSnackbar from '../../components-library/NotificationSnackbar';
import { checkSnapshot } from '../utils/snapshots';
import { customRender, fireEvent, screen } from '../Utils';
import { CustomContentProps } from 'notistack';

const mockCloseSnackbar = jest.fn();

jest.mock('notistack', () => ({
	...jest.requireActual('notistack'),
	useSnackbar: () => {
		return {
			closeSnackbar: mockCloseSnackbar,
		};
	},
}));

describe('NotificationSnackbar', () => {
	test.each([
		['info', 'This is an info message'],
		['success', 'This is a success message'],
		['warning', 'This is a warning message'],
		['error', 'This is an error message'],
	])('displays correct notification for %s type with correct message', (type, message) => {
		checkSnapshot(
			<NotificationSnackbar
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				style={{}}
				iconVariant={{}}
				id={type}
				persist={false}
				hideIconVariant={false}
				message={message}
				variant={type as CustomContentProps['variant']}
			/>,
		);
	});

	it('triggers action handler', () => {
		customRender(
			<NotificationSnackbar
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				style={{}}
				iconVariant={{}}
				id="id"
				persist={false}
				hideIconVariant={false}
				message="This is a test message"
				variant="info"
				action="Dismiss"
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Dismiss', exact: false }));
		expect(mockCloseSnackbar).toHaveBeenCalledTimes(1);
	});
});
