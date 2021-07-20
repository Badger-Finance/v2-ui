import { makeStyles, Typography } from '@material-ui/core';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import SettListItem from './SettListItem';
import { SettListViewProps } from './SettListView';
import SettTable from './SettTable';
import BadgerBoost from '../common/BadgerBoost';
import { inCurrency } from 'mobx/utils/helpers';
import { ContractNamespace } from 'web3/config/contract-namespace';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Sett } from '../../mobx/model/setts/sett';

const useStyles = makeStyles((theme) => ({
	boostContainer: {
		paddingBottom: theme.spacing(4),
	},
	messageContainer: {
		paddingTop: theme.spacing(4),
		textAlign: 'center',
	},
}));

const createSettListItem = (
	sett: Sett,
	itemBalance: TokenBalance,
	currency: string,
	period: string,
	onOpen: (sett: Sett) => void,
): JSX.Element | null => {
	if (!itemBalance || itemBalance.tokenBalance.eq(0)) {
		return null;
	}
	return (
		<SettListItem
			key={itemBalance.token.address}
			sett={sett}
			balance={itemBalance.balanceDisplay(5)}
			balanceValue={itemBalance.balanceValueDisplay(currency)}
			currency={currency}
			period={period}
			onOpen={() => onOpen(sett)}
		/>
	);
};

const UserListDisplay = observer((props: SettListViewProps) => {
	const classes = useStyles();
	const { onOpen, state } = props;
	const store = useContext(StoreContext);
	const {
		setts,
		uiState: { currency, period },
		wallet: { network },
		user,
	} = store;

	const currentSettMap = setts.getSettMap(state);
	if (currentSettMap === undefined || user.loadingBalances) {
		return <Loader message={`Loading My ${network.fullName} Setts...`} />;
	}
	if (currentSettMap === null) {
		return (
			<div className={classes.messageContainer}>
				<Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>
			</div>
		);
	}

	const walletList: JSX.Element[] = [];
	const settList: JSX.Element[] = [];
	const geyserList: JSX.Element[] = [];

	network.settOrder.forEach((contract) => {
		const contractAddress = Web3.utils.toChecksumAddress(contract);
		const sett = currentSettMap[contractAddress];
		const badgerSett = network.setts.find((sett) => sett.vaultToken.address === contractAddress);
		if (!sett || !badgerSett) {
			return null;
		}

		const walletBalance = user.getBalance(ContractNamespace.Token, badgerSett);
		const walletItem = createSettListItem(sett, walletBalance, currency, period, onOpen);
		if (walletItem) {
			walletList.push(walletItem);
		}

		const scalar = new BigNumber(sett.ppfs);
		const generalBalance = user.getBalance(ContractNamespace.Sett, badgerSett).scale(scalar, true);
		const guardedBalance = user.getBalance(ContractNamespace.GaurdedSett, badgerSett).scale(scalar, true);
		const settBalance = generalBalance ?? guardedBalance;
		const settItem = createSettListItem(sett, settBalance, currency, period, onOpen);
		if (settItem) {
			settList.push(settItem);
		}

		if (badgerSett.geyser) {
			const geyserBalance = user.getBalance(ContractNamespace.Geyser, badgerSett).scale(scalar, true);
			const geyserItem = createSettListItem(sett, geyserBalance, currency, period, onOpen);
			if (geyserItem) {
				geyserList.push(geyserItem);
			}
		}
	});

	const displayWallet = walletList.length > 0;
	const displayDeposit = settList.length > 0;
	const displayVault = geyserList.length > 0;

	return (
		<>
			<div className={classes.boostContainer}>
				<BadgerBoost />
			</div>
			{displayWallet && (
				<SettTable
					title={'Your Wallet -'}
					displayValue={inCurrency(user.walletValue, currency)}
					tokenTitle={'Available'}
					period={period}
					settList={walletList}
				/>
			)}
			{displayDeposit && (
				<SettTable
					title={'Your Vault Deposits -'}
					displayValue={inCurrency(user.settValue, currency)}
					tokenTitle={'Available'}
					period={period}
					settList={settList}
				/>
			)}
			{displayVault && (
				<SettTable
					title={'Your Staked Amounts -'}
					displayValue={inCurrency(user.geyserValue, currency)}
					tokenTitle={'Available'}
					period={period}
					settList={geyserList}
				/>
			)}
			{!displayWallet && !displayDeposit && !displayVault && (
				<Typography align="center" variant="subtitle1" color="textSecondary">
					Your address does not have tokens to deposit.
				</Typography>
			)}
		</>
	);
});

export default UserListDisplay;
