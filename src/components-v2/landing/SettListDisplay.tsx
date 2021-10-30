import { makeStyles, Typography } from '@material-ui/core';
import { Loader } from 'components/Loader';
import { BigNumber, ethers } from 'ethers';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import { ContractNamespace } from 'web3/config/contract-namespace';
import NoVaults from './NoVaults';
import SettListItem from './SettListItem';
import { SettListViewProps } from './SettListView';
import SettTable from './SettTable';

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
		uiState: { period, currency },
		network: { network },
		user,
	} = store;

	const currentSettMap = setts.getSettMap(state);

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
			const sett = currentSettMap[ethers.utils.getAddress(contract)];
			const badgerSett = network.setts.find((sett) => sett.vaultToken.address === contract);

			if (!sett || !badgerSett) {
				return;
			}

			// inject user balance information to enable withdraw buttun functionality
			const scalar = BigNumber.from(sett.pricePerFullShare);
			const generalBalance = user.getBalance(ContractNamespace.Sett, badgerSett).scale(scalar, true);
			const guardedBalance = user.getBalance(ContractNamespace.GaurdedSett, badgerSett).scale(scalar, true);
			const settBalance = generalBalance ?? guardedBalance;

			return (
				<SettListItem
					sett={sett}
					key={sett.name}
					currency={currency}
					period={period}
					balance={settBalance.balance}
				/>
			);
		})
		.filter(Boolean);

	if (settListItems.length === 0) {
		return <NoVaults state={state} network={network.name} />;
	}

	return <SettTable title={'All Setts'} displayValue={''} period={period} settList={settListItems} />;
});

export default SettListDisplay;
