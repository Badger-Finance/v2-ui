import { makeStyles, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import Web3 from 'web3';
import { BalanceNamespace } from 'web3/config/namespaces';
import NoVaults from './NoVaults';
import VaultListItem from './VaultListItem';
import { VaultListViewProps } from './VaultListView';
import VaultTable from './VaultTable';
import IbbtcVaultDepositDialog from '../ibbtc-vault/IbbtcVaultDepositDialog';
import { isVaultVaultIbbtc } from '../../utils/componentHelpers';

const useStyles = makeStyles((theme) => ({
	messageContainer: {
		paddingTop: theme.spacing(4),
		textAlign: 'center',
	},
}));

const VaultListDisplay = observer((props: VaultListViewProps) => {
	const classes = useStyles();
	const { state } = props;
	const store = useContext(StoreContext);
	const {
		vaults,
		uiState: { currency },
		network: { network },
		user,
	} = store;

	const currentVaultMap = vaults.getVaultMapByState(state);

	if (currentVaultMap === undefined) {
		return <Loader message={`Loading ${network.name} Setts...`} />;
	}

	if (currentVaultMap === null) {
		return (
			<div className={classes.messageContainer}>
				<Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>
			</div>
		);
	}

	const settListItems = network.settOrder
		.map((contract) => {
			const vault = currentVaultMap[Web3.utils.toChecksumAddress(contract)];
			const badgerVault = network.vaults.find((vault) => vault.vaultToken.address === contract);

			if (!vault || !badgerVault) {
				return;
			}

			// inject user balance information to enable withdraw buttun functionality
			const scalar = new BigNumber(vault.pricePerFullShare);
			const generalBalance = user.getBalance(BalanceNamespace.Vault, badgerVault).scale(scalar, true);
			const guardedBalance = user.getBalance(BalanceNamespace.GuardedVault, badgerVault).scale(scalar, true);
			const settBalance = generalBalance ?? guardedBalance;
			const isIbbtc = isVaultVaultIbbtc(vault);

			return (
				<VaultListItem
					vault={vault}
					key={vault.vaultToken}
					currency={currency}
					balance={settBalance.balance}
					CustomDepositModal={isIbbtc ? IbbtcVaultDepositDialog : undefined}
				/>
			);
		})
		.filter(Boolean);

	if (settListItems.length === 0) {
		return <NoVaults state={state} network={network.name} />;
	}

	return <VaultTable title={'All Vaults'} displayValue={''} settList={settListItems} />;
});

export default VaultListDisplay;
