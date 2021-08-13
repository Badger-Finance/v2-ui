import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import SettListDisplay from './SettListDisplay';
import UserListDisplay from './UserListDisplay';
import { SettState } from '../../mobx/model/setts/sett-state';

export interface SettListViewProps {
	state: SettState;
}

const SettListView = observer(({ state }: SettListViewProps) => {
	const store = useContext(StoreContext);

	const {
		uiState: { hideZeroBal },
		wallet: { connectedAddress },
	} = store;

	const showUserDisplay = hideZeroBal && connectedAddress;
	return (
		<>
			{showUserDisplay && <UserListDisplay state={state} />}
			{!showUserDisplay && <SettListDisplay state={state} />}
		</>
	);
});

export default SettListView;
