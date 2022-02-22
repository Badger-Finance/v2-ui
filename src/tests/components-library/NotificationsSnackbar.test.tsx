import React from 'react';
import NotificationSnackbar, { NotificationSnackbarProps } from '../../components-library/NotificationSnackbar';
import { checkSnapshot } from '../utils/snapshots';
import { customRender, fireEvent, screen } from '../Utils';

describe('NotificationSnackbar', () => {
	test.each([
		['info', 'This is an info message'],
		['success', 'This is a success message'],
		['warning', 'This is a warning message'],
		['error', 'This is an error message'],
	])('displays correct notification for %s type with correct message', (type, message) => {
		checkSnapshot(<NotificationSnackbar message={message} type={type as NotificationSnackbarProps['type']} />);
	});

	it('triggers action handler', () => {
		const mockHandler = jest.fn();
		customRender(
			<NotificationSnackbar
				message="This is a test message"
				type="info"
				action="Dismiss"
				onActionClick={mockHandler}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Dismiss', exact: false }));
		expect(mockHandler).toHaveBeenCalledTimes(1);
	});
});
