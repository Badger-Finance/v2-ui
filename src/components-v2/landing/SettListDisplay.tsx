import { Typography } from '@material-ui/core';
import SettListItem from 'components-v2/landing/SettListItem';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { Vault } from 'mobx/model';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import Web3 from 'web3';
import { SettListViewProps } from './SettListView';
import SettTable from './SettTable';

const SettListDisplay = observer((props: SettListViewProps) => {
	const { onOpen } = props;
	const store = useContext(StoreContext);
	const {
		setts: { keyedSettList },
		uiState: { currency, period },
		contracts: { vaults },
		wallet: { network },
	} = store;

	if (keyedSettList === undefined) {
		return <Loader message={'Loading Setts...'} />;
	}
	if (keyedSettList === null) {
		return <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>;
	}
	const settListItems = network.settOrder.map((contract) => {
		if (!keyedSettList[contract]) return;
		const vault: Vault = vaults[Web3.utils.toChecksumAddress(keyedSettList[contract].vaultToken)];
		return (
			<SettListItem
				sett={keyedSettList[contract]}
				key={keyedSettList[contract].name}
				currency={currency}
				period={period}
				onOpen={() => onOpen(vault, keyedSettList[contract])}
			/>
		);
	});
	return <SettTable title={'All Setts'} tokenTitle={'Tokens'} period={period} settList={settListItems} />;
});

export default SettListDisplay;
