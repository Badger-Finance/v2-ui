import InfluenceVaultDetail from 'components-v2/InfluenceVault/InfluenceVaultDetail';
import { isInfluenceVault } from 'components-v2/InfluenceVault/InfluenceVaultUtil';
import { VaultDetail } from 'components-v2/vault-detail/VaultDetail';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import { StoreContext } from '../../mobx/stores/store-context';

export const VaultDetailWrapper = observer((): JSX.Element => {
  const { vaultDetail } = useContext(StoreContext);
  const { vault } = vaultDetail;
  const isAnInfluenceVault = vault && isInfluenceVault(vault.vaultToken);

  return <>{isAnInfluenceVault ? <InfluenceVaultDetail /> : <VaultDetail />}</>;
});
