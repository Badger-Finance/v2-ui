import usePrevious from 'hooks/usePrevious';
import { runInAction } from 'mobx';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect } from 'react';

import { NETWORK_IDS, NETWORK_IDS_TO_NAMES } from '../../config/constants';

// should this just be a hook or something?
const NetworkURLManager = (): JSX.Element => {
  const {
    router,
    sdk: { config },
    wallet,
  } = useContext(StoreContext);
  const chainId = config.chainId;
  const previousChainId = usePrevious(config.chainId);

  useEffect(() => {
    if (!chainId) {
      return;
    }

    if (chainId !== previousChainId && wallet.isConnected) {
      runInAction(() => {
        router.queryParams = {
          ...router.queryParams,
          chain: NETWORK_IDS_TO_NAMES[chainId as NETWORK_IDS],
        };
      });
    }
  }, [chainId, previousChainId, router, wallet]);

  useEffect(() => {
    const urlChainId = router.queryParams?.chain;
    if (chainId && !urlChainId) {
      router.queryParams = {
        ...router.queryParams,
        chain: NETWORK_IDS_TO_NAMES[chainId as NETWORK_IDS],
      };
    }
  }, [chainId, wallet, router]);

  return <></>;
};

export default observer(NetworkURLManager);
