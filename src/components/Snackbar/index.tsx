import React from 'react';
import { observer } from 'mobx-react-lite';
import { SnackbarProvider } from 'notistack';
import NotificationSnackbar from '../../components-library/NotificationSnackbar';

export const Snackbar = observer((props: any) => {
	return (
		<SnackbarProvider
			autoHideDuration={6000}
			maxSnack={5}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			Components={{
				default: NotificationSnackbar,
				info: NotificationSnackbar,
				success: NotificationSnackbar,
				error: NotificationSnackbar,
				warning: NotificationSnackbar,
			}}
		>
			{props.children}
		</SnackbarProvider>
	);
});
