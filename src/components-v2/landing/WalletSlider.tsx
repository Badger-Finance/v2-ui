import React, { useContext } from 'react';
import { FormControlLabel, Switch, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	walletSlider: {
		marginLeft: theme.spacing(1),
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
