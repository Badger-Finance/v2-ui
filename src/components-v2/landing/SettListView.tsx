import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Sett, SettState } from '../../mobx/model';
import SettListDisplay from './SettListDisplay';
import UserListDisplay from './UserListDisplay';

export interface SettListViewProps {
	onOpen: (sett: Sett) => void;
	state: SettState;
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
