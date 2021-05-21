import { Typography } from '@material-ui/core';
import SettListItem from 'components-v2/landing/SettListItem';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import Web3 from 'web3';
import { SettListViewProps } from './SettListView';
import SettTable from './SettTable';

const SettListDisplay = observer((props: SettListViewProps) => {
	const { onOpen, experimental } = props;
	const store = useContext(StoreContext);
	const {
		setts: { settMap, experimentalMap },
		uiState: { currency, period },
		wallet: { network },
	} = store;

	const currentSettMap = experimental ? experimentalMap : settMap;

	if (currentSettMap === undefined) {
		return <Loader message={`Loading ${network.fullName} Setts...`} />;
	}
	if (currentSettMap === null) {
		return <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>;
	}

	const settListItems = network.settOrder
		.map((contract) => {
			const sett = currentSettMap[Web3.utils.toChecksumAddress(contract)];
			if (!sett) {
				return;
			}
			return (
				<SettListItem
					sett={sett}
					key={sett.name}
					currency={currency}
					period={period}
					onOpen={() => onOpen(sett)}
				/>
			);
		})
		.filter(Boolean);
	return (
		<SettTable
			title={'All Setts'}
			displayValue={''}
			tokenTitle={'Tokens'}
			period={period}
			settList={settListItems}
		/>
	);
});

export default SettListDisplay;
