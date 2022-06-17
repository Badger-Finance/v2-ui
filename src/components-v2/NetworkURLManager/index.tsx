import usePrevious from 'hooks/usePrevious';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect } from 'react';

import { NETWORK_IDS, NETWORK_IDS_TO_NAMES } from '../../config/constants';

const NetworkURLManager: React.FC = ({ children }) => {
	const { router, wallet } = useContext(StoreContext);
	const chainId = wallet.chainId;
	const previousChainId = usePrevious(wallet.chainId);

	useEffect(() => {
		if (!chainId) {
			return;
		}

		if (chainId !== previousChainId && wallet.isConnected) {
			router.queryParams = { ...router.queryParams, chain: NETWORK_IDS_TO_NAMES[chainId as NETWORK_IDS] };
		}
	}, [chainId, previousChainId, router, wallet]);

	useEffect(() => {
		const urlChainId = router.queryParams?.chain;
		if (chainId && !urlChainId) {
			router.queryParams = { ...router.queryParams, chain: NETWORK_IDS_TO_NAMES[chainId as NETWORK_IDS] };
		}
	}, [chainId, wallet, router]);

	return <>{children}</>;
};

export default observer(NetworkURLManager);
