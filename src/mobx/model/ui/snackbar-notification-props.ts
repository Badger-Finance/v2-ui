import { CustomContentProps } from 'notistack';

export interface SnackbarNotificationProps {
	message: string;
	variant: CustomContentProps['variant'];
	action?: CustomContentProps['action'];
	hash?: string;
}
