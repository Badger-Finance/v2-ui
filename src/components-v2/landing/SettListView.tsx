import React, { useContext } from 'react';
import { Sett, Vault } from '../../mobx/model';

import SettListDisplay from './SettListDisplay';
import { StoreContext } from 'mobx/store-context';
import UserListDisplay from './UserListDisplay';
import { observer } from 'mobx-react-lite';

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
