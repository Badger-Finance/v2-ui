import { VaultDTO } from '@badger-dao/sdk';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { StoreContext } from 'mobx/stores/store-context';
import { useContext } from 'react';

import { getUserVaultBoost } from '../utils/componentHelpers';

interface VaultInformation {
	vaultBoost: number;
	boostContribution: number | null;
	depositBalance: TokenBalance;
	depositBalanceDisplay: string;
}

export function useVaultInformation(vault: VaultDTO): VaultInformation {
	const { user, vaults } = useContext(StoreContext);
	const { showAPR } = vaults.vaultsFilters;
	const depositBalance = user.getBalance(vault.vaultToken);
	let vaultBoost = showAPR ? vault.apr : vault.apy;

	if (user.accountDetails?.boost) {
		vaultBoost = getUserVaultBoost(vault, user.accountDetails.boost, showAPR);
	}

	const boostContribution =
		vaultBoost && vault.minApy && vault.minApr
			? Math.max(0, vaultBoost - (showAPR ? vault.minApr : vault.minApy))
			: null;

	const depositBalanceDisplay = depositBalance.balanceValueDisplay();

	return {
		vaultBoost,
		boostContribution,
		depositBalance,
		depositBalanceDisplay,
	};
}
