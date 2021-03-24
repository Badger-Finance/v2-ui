import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Sett, Vault } from '../../mobx/model';
import SettListDisplay from './SettListDisplay';
import UserListDisplay from './UserListDisplay';

export interface SettListViewProps {
	onOpen: (vault: Vault, sett: Sett) => void;
}

const SettListView = observer((props: SettListViewProps) => {
	const store = useContext(StoreContext);
	const { onOpen } = props;

	const {
		uiState: { hideZeroBal },
		wallet: { connectedAddress },
	} = store;

	return (
		<>
			{hideZeroBal && connectedAddress ? (
				<UserListDisplay onOpen={onOpen} />
			) : (
				<SettListDisplay onOpen={onOpen} />
			)}
		</>
	);
});

export default SettListView;
