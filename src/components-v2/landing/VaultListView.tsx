import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import VaultListDisplay from './VaultListDisplay';
import UserListDisplay from './UserListDisplay';
import { VaultState } from '@badger-dao/sdk';

export interface VaultListViewProps {
	state: VaultState;
}

const VaultListView = observer(({ state }: VaultListViewProps) => {
	const store = useContext(StoreContext);
	const {
		onboard,
		uiState: { showUserBalances },
	} = store;
	const showUserDisplay = showUserBalances && onboard.isActive();
	if (showUserDisplay) {
		return <UserListDisplay />;
	}

	return <VaultListDisplay state={state} />;
});

export default VaultListView;
