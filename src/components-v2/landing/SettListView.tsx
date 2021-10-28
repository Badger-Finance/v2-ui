import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import SettListDisplay from './SettListDisplay';
import UserListDisplay from './UserListDisplay';
import { SettState } from '@badger-dao/sdk';

export interface SettListViewProps {
	state: SettState;
}

const SettListView = observer(({ state }: SettListViewProps) => {
	const store = useContext(StoreContext);
	const {
		uiState: { showUserBalances },
		wallet: { connectedAddress },
	} = store;
	const showUserDisplay = showUserBalances && connectedAddress;
	return showUserDisplay ? <UserListDisplay state={state} /> : <SettListDisplay state={state} />;
});

export default SettListView;
