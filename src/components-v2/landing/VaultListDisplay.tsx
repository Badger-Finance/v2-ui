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

	if (vaultOrder === undefined || vaults.vaultsDefinitions === undefined) {
		return <Loader message={`Loading ${network.name} Setts...`} />;
	}

	if (vaultOrder === null || vaults.vaultsDefinitions === null) {
		return (
			<div className={classes.messageContainer}>
				<Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>
			</div>
		);
	}

	const settListItems = vaultOrder.flatMap((vault) => {
		const badgerVault = vaults.getVaultDefinition(vault);

		if (!badgerVault) {
			return [];
		}

		const scalar = new BigNumber(vault.pricePerFullShare);
		const depositBalance = user.getBalance(BalanceNamespace.Vault, badgerVault).scale(scalar, true);
		const hasNoBalance = depositBalance.tokenBalance.eq(0);

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
