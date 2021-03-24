import { Typography } from '@material-ui/core';
import SettListItem from 'components-v2/landing/SettListItem';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { Vault } from 'mobx/model';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import { SettListViewProps } from './SettListView';
import SettTable from './SettTable';

const SettListDisplay = observer((props: SettListViewProps) => {
	const { onOpen } = props;
	const store = useContext(StoreContext);
	const {
		setts: { settMap },
		uiState: { currency, period },
		contracts: { vaults },
		wallet: { network },
	} = store;

	if (settMap === undefined) {
		return <Loader message={`Loading ${network.fullName} Setts...`} />;
	}
	if (settMap === null) {
		return <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>;
	}
	const settListItems = network.settOrder
		.map((contract) => {
			if (!settMap[contract]) {
				return;
			}
			const vault: Vault = vaults[settMap[contract].vaultToken];
			return (
				<SettListItem
					sett={settMap[contract]}
					key={settMap[contract].name}
					currency={currency}
					period={period}
					onOpen={() => onOpen(vault, settMap[contract])}
				/>
			);
		})
		.filter(Boolean);
	return <SettTable title={'All Setts'} tokenTitle={'Tokens'} period={period} settList={settListItems} />;
});

export default SettListDisplay;
