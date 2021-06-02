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
import { Sett } from 'mobx/model';
import { TokenBalance } from 'mobx/model/token-balance';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles((theme) => ({
	boostContainer: {
		paddingBottom: theme.spacing(4),
	},
}));

const createSettListItem = (
	namespace: ContractNamespace,
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
			key={`${namespace}-${sett.name}`}
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
	const { onOpen, experimental } = props;
	const store = useContext(StoreContext);
	const {
		setts: { settMap, experimentalMap },
		uiState: { currency, period },
		wallet: { network },
		user,
	} = store;

	const currentSettMap = experimental ? experimentalMap : settMap;
	if (currentSettMap === undefined || user.loadingBalances) {
		return <Loader message={`Loading My ${network.fullName} Setts...`} />;
	}
	if (currentSettMap === null) {
		return <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>;
	}

	const walletList: JSX.Element[] = [];
	const settList: JSX.Element[] = [];
	const geyserList: JSX.Element[] = [];

	network.settOrder.forEach((contract) => {
		const sett = currentSettMap[contract];
		const badgerSett = network.setts.find((sett) => sett.vaultToken.address === contract);
		if (!sett || !badgerSett) {
			return null;
		}

		const walletBalance = user.getBalance(ContractNamespace.Token, badgerSett);
		const walletItem = createSettListItem(ContractNamespace.Token, sett, walletBalance, currency, period, onOpen);
		if (walletItem) {
			walletList.push(walletItem);
		}

		const scalar = new BigNumber(sett.ppfs);
		const settBalance = user.getBalance(ContractNamespace.Sett, badgerSett).scale(scalar, true);
		const settItem = createSettListItem(ContractNamespace.Sett, sett, settBalance, currency, period, onOpen);
		if (settItem) {
			settList.push(settItem);
		}

		if (badgerSett.geyser) {
			const geyserBalance = user.getBalance(ContractNamespace.Geyser, badgerSett).scale(scalar, true);
			const geyserItem = createSettListItem(
				ContractNamespace.Geyser,
				sett,
				geyserBalance,
				currency,
				period,
				onOpen,
			);
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
					displayValue={inCurrency(user.walletValue(), currency)}
					tokenTitle={'Available'}
					period={period}
					settList={walletList}
				/>
			)}
			{displayDeposit && (
				<SettTable
					title={'Your Vault Deposits -'}
					displayValue={inCurrency(user.settValue(), currency)}
					tokenTitle={'Available'}
					period={period}
					settList={settList}
				/>
			)}
			{displayVault && (
				<SettTable
					title={'Your Staked Amounts -'}
					displayValue={inCurrency(user.geyserValue(), currency)}
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
