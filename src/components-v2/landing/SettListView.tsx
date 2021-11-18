import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import SettListDisplay from './SettListDisplay';
import UserListDisplay from './UserListDisplay';
import { SettState } from '@badger-dao/sdk';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
	displayContainer: {
		maxHeight: `calc(100vh - 152px)`,
	},
}));

export interface SettListViewProps {
	state: SettState;
}

const SettListView = observer(({ state }: SettListViewProps) => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		onboard,
		uiState: { showUserBalances },
	} = store;
	const showUserDisplay = showUserBalances && onboard.isActive();
	if (showUserDisplay) {
		return <UserListDisplay />;
	}
	return (
		<div className={classes.displayContainer}>
			<SettListDisplay state={state} />
		</div>
	);
});

export default SettListView;
