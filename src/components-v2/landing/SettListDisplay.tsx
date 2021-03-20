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
		setts: { settList },
		uiState: { currency, period },
		contracts: { vaults },
	} = store;

	if (settList === undefined) {
		return <Loader message={'Loading Setts...'} />;
	}
	if (settList === null) {
		return <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>;
	}
	const settListItems = settList.map((sett) => {
		const vault: Vault = vaults[Web3.utils.toChecksumAddress(sett.vaultToken)];
		return (
			<SettListItem
				sett={sett}
				key={sett.name}
				currency={currency}
				period={period}
				onOpen={() => onOpen(vault, sett)}
			/>
		);
	});
	return <SettTable title={'All Setts'} tokenTitle={'Tokens'} period={period} settList={settListItems} />;
});

export default SettListDisplay;
