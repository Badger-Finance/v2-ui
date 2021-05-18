import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Sett } from '../../mobx/model';
import SettListDisplay from './SettListDisplay';
import UserListDisplay from './UserListDisplay';

export interface SettListViewProps {
	onOpen: (sett: Sett) => void;
	experimental: boolean;
}

const SettListView = observer((props: SettListViewProps) => {
	const store = useContext(StoreContext);
	const { onOpen, experimental } = props;

	const {
		uiState: { hideZeroBal },
		wallet: { connectedAddress },
	} = store;

	const showUserDisplay = hideZeroBal && connectedAddress;
	return (
		<>
			{showUserDisplay && <UserListDisplay experimental={experimental} onOpen={onOpen} />}
			{!showUserDisplay && <SettListDisplay experimental={experimental} onOpen={onOpen} />}
		</>
	);
});

export default SettListView;
