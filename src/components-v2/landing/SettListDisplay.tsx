import { makeStyles, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import Web3 from 'web3';
import { BalanceNamespace } from 'web3/config/namespaces';
import NoVaults from './NoVaults';
import SettListItem from './SettListItem';
import { SettListViewProps } from './SettListView';
import SettTable from './SettTable';
import mainnetDeploy from '../../config/deployments/mainnet.json';
import DepositDialog from '../ibbtc-vault/DepositDialog';

const useStyles = makeStyles((theme) => ({
	messageContainer: {
		paddingTop: theme.spacing(4),
		textAlign: 'center',
	},
}));

const SettListDisplay = observer((props: SettListViewProps) => {
	const classes = useStyles();
	const { state } = props;
	const store = useContext(StoreContext);
	const {
		setts,
		uiState: { currency },
		network: { network },
		user,
	} = store;

	const currentSettMap = setts.getSettMapByState(state);

	if (currentSettMap === undefined) {
		return <Loader message={`Loading ${network.name} Setts...`} />;
	}

	if (currentSettMap === null) {
		return (
			<div className={classes.messageContainer}>
				<Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>
			</div>
		);
	}

	const settListItems = network.settOrder
		.map((contract) => {
			const sett = currentSettMap[Web3.utils.toChecksumAddress(contract)];
			const badgerSett = network.setts.find((sett) => sett.vaultToken.address === contract);

			if (!sett || !badgerSett) {
				return;
			}

			// inject user balance information to enable withdraw buttun functionality
			const scalar = new BigNumber(sett.pricePerFullShare);
			const generalBalance = user.getBalance(BalanceNamespace.Sett, badgerSett).scale(scalar, true);
			const guardedBalance = user.getBalance(BalanceNamespace.GuardedSett, badgerSett).scale(scalar, true);
			const settBalance = generalBalance ?? guardedBalance;
			const isIbbtc = sett.settToken === mainnetDeploy.sett_system.vaults['native.ibbtcCrv'];

			return (
				<SettListItem
					sett={sett}
					key={sett.settToken}
					currency={currency}
					balance={settBalance.balance}
					CustomDepositModal={isIbbtc ? DepositDialog : undefined}
				/>
			);
		})
		.filter(Boolean);

	if (settListItems.length === 0) {
		return <NoVaults state={state} network={network.name} />;
	}

	return <SettTable title={'All Setts'} displayValue={''} settList={settListItems} />;
});

export default SettListDisplay;
