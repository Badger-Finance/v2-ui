import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/stores/store-context';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect } from 'react';

const SnackbarManager: React.FC = (props): JSX.Element => {
	const { enqueueSnackbar } = useSnackbar();
	const {
		uiState: { notification },
		onboard: { notify },
		network: { network },
	} = useContext(StoreContext);

	const enq = () => {
		if (!notification || !notification.message) return;
		// Notify doesn't support BSC currently, so it is temporarily disabled for it
		if (notification.hash && network.id === 1) {
			// then on each transaction...
			const { emitter } = notify.hash(notification.hash);
			emitter.on('all', (tx) => network.notifyLink(tx));
		} else {
			enqueueSnackbar(notification.message, { ...notification, persist: false });
		}
	};

	useEffect(enq, [notification, network, notify, enqueueSnackbar]);

	return <>{props.children}</>;
};

export default observer(SnackbarManager);
