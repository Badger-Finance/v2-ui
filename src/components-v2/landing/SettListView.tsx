import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import SettListDisplay from './SettListDisplay';
import UserListDisplay from './UserListDisplay';
import { Sett } from '../../mobx/model/setts/sett';
import { VaultState } from '@badger-dao/sdk';

export interface SettListViewProps {
	onOpen: (sett: Sett) => void;
	state: VaultState;
}

const SettListView = observer((props: SettListViewProps) => {
	const store = useContext(StoreContext);
	const { onOpen, state } = props;

	const {
		uiState: { hideZeroBal },
		wallet: { connectedAddress },
	} = store;

	const showUserDisplay = hideZeroBal && connectedAddress;
	return (
		<>
			{showUserDisplay && <UserListDisplay state={state} onOpen={onOpen} />}
			{!showUserDisplay && <SettListDisplay state={state} onOpen={onOpen} />}
		</>
	);
});

export default SettListView;
