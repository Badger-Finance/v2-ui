import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

import InfluenceVaultDetail from 'components-v2/InfluenceVault/InfluenceVaultDetail';
import { VaultDetail } from 'components-v2/vault-detail/VaultDetail';
import { isInfluenceVault } from 'components-v2/InfluenceVault/InfluenceVaultUtil';

export const VaultDetailWrapper = observer((): JSX.Element => {
	const { vaultDetail } = useContext(StoreContext);
	const { vault } = vaultDetail;
	const isAInfluenceVault = vault && isInfluenceVault(vault.vaultToken);

	return <>{isAInfluenceVault ? <InfluenceVaultDetail /> : <VaultDetail />}</>;
});
