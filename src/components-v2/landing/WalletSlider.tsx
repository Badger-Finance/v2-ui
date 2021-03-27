import { FormControlLabel, Switch, makeStyles } from '@material-ui/core';
import React, { useContext } from 'react';

import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	walletSlider: {
		marginLeft: theme.spacing(1),
	},
}));

const WalletSlider = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		uiState: { hideZeroBal, setHideZeroBal },
	} = store;

	return (
		<FormControlLabel
			control={<Switch checked={hideZeroBal} onChange={() => setHideZeroBal(!hideZeroBal)} color="primary" />}
			label="Portfolio View"
			className={classes.walletSlider}
		/>
	);
});

export default WalletSlider;
