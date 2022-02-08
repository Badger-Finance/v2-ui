import { makeStyles, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import { BalanceNamespace } from 'web3/config/namespaces';
import NoVaults from './NoVaults';
import VaultListItem from './VaultListItem';
import VaultList from './VaultList';
import IbbtcVaultDepositDialog from '../ibbtc-vault/IbbtcVaultDepositDialog';
import { isVaultVaultIbbtc } from '../../utils/componentHelpers';
import { VaultState } from '@badger-dao/sdk';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { VaultNameSource } from '../../mobx/model/vaults/vault-name-source';

const useStyles = makeStyles((theme) => ({
	messageContainer: {
		paddingTop: theme.spacing(4),
		textAlign: 'center',
	},
}));

const VaultListDisplay = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		vaults,
		network: { network },
		user,
	} = store;

	const vaultOrder = vaults.getVaultOrder();

	if (vaultOrder === undefined) {
		return <Loader message={`Loading ${network.name} Setts...`} />;
	}

	if (vaultOrder === null) {
		return (
			<div className={classes.messageContainer}>
				<Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>
			</div>
		);
	}

	// we keep track of the vault names to prevent duplicates
	const vaultNameOccurrences: Record<string, number> = {};

	const settListItems = vaultOrder.flatMap((vault) => {
		// TODO: This isn't really needed - but let's keep it until we have sdk fallbacks in place
		const badgerVault = network.vaults.find((badgerVault) => badgerVault.vaultToken.address === vault.vaultToken);

		if (!badgerVault) {
			return [];
		}

		const scalar = new BigNumber(vault.pricePerFullShare);
		const depositBalance = user.getBalance(BalanceNamespace.Vault, badgerVault).scale(scalar, true);
		const hasNoBalance = depositBalance.tokenBalance.eq(0);

		const occurrenceKey = `${vault.protocol}-${vault.name}`;
		const vaultNameOccurrence = (vaultNameOccurrences[occurrenceKey] ?? 0) + 1;
		const hasOverlappingName = vaultNameOccurrence > 1;
		vaultNameOccurrences[occurrenceKey] = vaultNameOccurrence;

		// Hide the remBadger vault from users who do not have rembadger (this default hides the sett)
		if (badgerVault.vaultToken.address === ETH_DEPLOY.sett_system.vaults['native.rembadger'] && hasNoBalance) {
			return [];
		}

		// Hide deprecated vaults that the user is not deposited into
		if (vault.state === VaultState.Deprecated && hasNoBalance) {
			return [];
		}

		return (
			<VaultListItem
				vault={vault}
				key={vault.vaultToken}
				depositBalance={depositBalance}
				nameSource={hasOverlappingName ? VaultNameSource.DepositTokenSymbol : VaultNameSource.VaultName}
				CustomDepositModal={isVaultVaultIbbtc(vault) ? IbbtcVaultDepositDialog : undefined}
			/>
		);
	});

	if (settListItems.length === 0 && vaults.vaultsFiltersCount === 0) {
		return <NoVaults network={network.name} />;
	}

	return <VaultList title="Vaults" settList={settListItems} />;
});

export default VaultListDisplay;
