import React, { useEffect } from 'react';
import { useContext } from 'react';
import { StoreContext } from '../../../mobx/store-context';
import Notify from 'bnc-notify';
import { useSnackbar } from 'notistack';

const notify = Notify({
	dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07', // [String] The API key created by step one above
	networkId: 1, // [Integer] The Ethereum network ID your Dapp uses.
});
notify.config({
	darkMode: true, // (default: false)
});

function addEtherscan(transaction: any) {
	return {
		link: `https://etherscan.io/tx/${transaction.hash}`,
	};
}
function NotifyHook() {
    const store = useContext(StoreContext);
    const {
        uiState: {notification },
    } = store;
    const { enqueueSnackbar } = useSnackbar();
    
    const enq = () => {
        if (!notification || !notification.message) return;
    
        if (notification.hash) {
            // then on each transaction...
            const { emitter } = notify.hash(notification.hash);
            emitter.on('all', addEtherscan);
        } else {
            enqueueSnackbar(notification.message, { variant: notification.variant, persist: false });
        }
    };
    useEffect(enq, [notification]);
}

export { NotifyHook };
