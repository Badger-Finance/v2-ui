import { FormControlLabel, makeStyles, Switch } from '@material-ui/core';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

const useStyles = makeStyles(() => ({
	walletSlider: {
		height: 36,
	},
}));

const WalletSlider = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		uiState: { showUserBalances, setShowUserBalances },
	} = store;

	return (
		<FormControlLabel
			control={
				<Switch
					checked={showUserBalances}
					onChange={() => setShowUserBalances(!showUserBalances)}
					color="primary"
				/>
			}
			label="Portfolio View"
			className={classes.walletSlider}
		/>
	);
});

export default WalletSlider;
