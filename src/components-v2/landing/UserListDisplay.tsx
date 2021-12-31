import { makeStyles, Typography } from '@material-ui/core';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import VaultListItem from './VaultListItem';
import VaultTable from './VaultTable';
import { inCurrency } from 'mobx/utils/helpers';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { BalanceNamespace } from 'web3/config/namespaces';
import { Currency } from 'config/enums/currency.enum';
import { BouncerType, Vault, VaultState, ValueSource } from '@badger-dao/sdk';
import IbbtcVaultDepositDialog from '../ibbtc-vault/IbbtcVaultDepositDialog';
import { isVaultVaultIbbtc } from '../../utils/componentHelpers';

const useStyles = makeStyles((theme) => ({
	messageContainer: {
		paddingTop: theme.spacing(4),
		textAlign: 'center',
	},
	noDeposit: {
		marginTop: theme.spacing(8),
	},
	tableContainer: {
		marginBottom: theme.spacing(2),
	},
}));

const createVaultListItem = (vault: Vault, itemBalance: TokenBalance, currency: Currency): JSX.Element | null => {
	const isIbbtc = isVaultVaultIbbtc(vault);

	if (!itemBalance || itemBalance.tokenBalance.eq(0)) {
		return null;
	}
	return (
		<VaultListItem
			accountView
			key={itemBalance.token.address}
			vault={vault}
			balance={itemBalance.balance}
			balanceValue={itemBalance.balanceValueDisplay(currency)}
			currency={currency}
			CustomDepositModal={isIbbtc ? IbbtcVaultDepositDialog : undefined}
		/>
	);
};

const UserListDisplay = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		vaults,
		user,
		uiState: { currency },
		network: { network },
	} = store;

	const currentVaultMap = vaults.getVaultMap();

	if (currentVaultMap === undefined || user.loadingBalances) {
		return <Loader message={`Loading My ${network.name} Setts...`} />;
	}

	if (currentVaultMap === null) {
		return (
			<div className={classes.messageContainer}>
				<Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>
			</div>
		);
	}

	const walletList: JSX.Element[] = [];
	const settList: JSX.Element[] = [];

	const accountedTokens = new Set<string>();
	network.settOrder.forEach((contract) => {
		const contractAddress = Web3.utils.toChecksumAddress(contract);
		const vault = currentVaultMap[contractAddress];
		const badgerVault = network.vaults.find((vault) => vault.vaultToken.address === contractAddress);

		if (!vault || !badgerVault) {
			return null;
		}

		const walletBalance = user.getBalance(BalanceNamespace.Token, badgerVault);
		const walletItem = createVaultListItem(vault, walletBalance, currency);

		if (walletItem) {
			walletList.push(walletItem);
			accountedTokens.add(walletBalance.token.address);
		}

		const scalar = new BigNumber(vault.pricePerFullShare);
		const generalBalance = user.getBalance(BalanceNamespace.Vault, badgerVault).scale(scalar, true);
		const guardedBalance = user.getBalance(BalanceNamespace.GuardedVault, badgerVault).scale(scalar, true);
		const deprecatedBalance = user.getBalance(BalanceNamespace.Deprecated, badgerVault).scale(scalar, true);
		const settBalance = generalBalance ?? guardedBalance ?? deprecatedBalance;
		const settItem = createVaultListItem(vault, settBalance, currency);

		if (settItem) {
			settList.push(settItem);
			accountedTokens.add(settBalance.token.address);
		}
	});

	vaults.protocolTokens.forEach((token) => {
		if (accountedTokens.has(token)) {
			return;
		}
		const walletBalance = user.getTokenBalance(token);
		const tokenInfo = vaults.getToken(token);
		const mockVault = {
			name: tokenInfo.name,
			state: VaultState.Open,
			vaultToken: tokenInfo.address,
			vaultAsset: tokenInfo.symbol,
			sources: [] as ValueSource[],
			bouncer: BouncerType.None,
		};
		const walletItem = createVaultListItem(mockVault as Vault, walletBalance, currency);
		if (walletItem) {
			walletList.push(walletItem);
		}
	});

	const displayWallet = walletList.length > 0;
	const displayDeposit = settList.length > 0;

	return (
		<>
			{displayWallet && (
				<div className={classes.tableContainer}>
					<VaultTable
						title={'Your Wallet:'}
						displayValue={inCurrency(user.walletValue, currency)}
						settList={walletList}
					/>
				</div>
			)}
			{displayDeposit && (
				<div className={classes.tableContainer}>
					<VaultTable
						title={'Your Vault Deposits:'}
						displayValue={inCurrency(user.vaultValue, currency)}
						settList={settList}
					/>
				</div>
			)}
			{!displayWallet && !displayDeposit && (
				<Typography className={classes.noDeposit} align="center" variant="subtitle1" color="textSecondary">
					Your address does not have tokens to deposit.
				</Typography>
			)}
		</>
	);
});

export default UserListDisplay;
