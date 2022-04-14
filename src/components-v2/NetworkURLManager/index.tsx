import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import usePrevious from 'hooks/usePrevious';
import { NETWORK_IDS, NETWORK_IDS_TO_NAMES } from '../../config/constants';

const NetworkURLManager: React.FC = ({ children }) => {
	const { router, onboard } = useContext(StoreContext);
	const urlChainId = router.queryParams?.chain;
	const chainId = onboard.chainId;
	const previousChainId = usePrevious(onboard.chainId);

	useEffect(() => {
		if (!chainId) {
			return;
		}

		if (chainId !== previousChainId && onboard.isActive()) {
			router.queryParams = { ...router.queryParams, chain: NETWORK_IDS_TO_NAMES[chainId as NETWORK_IDS] };
		}
	}, [chainId, previousChainId, urlChainId, router, onboard]);

	useEffect(() => {
		if (chainId && !urlChainId) {
			router.queryParams = { ...router.queryParams, chain: NETWORK_IDS_TO_NAMES[chainId as NETWORK_IDS] };
		}
	}, [chainId, router, urlChainId]);

	return <>{children}</>;
};

export default observer(NetworkURLManager);
