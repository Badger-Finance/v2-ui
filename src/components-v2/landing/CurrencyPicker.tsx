import { MenuItem, Select, makeStyles } from '@material-ui/core';
import React, { useContext } from 'react';

import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	currencyPicker: {
		height: '1.8rem',
		overflow: 'hidden',
		marginLeft: theme.spacing(1),
	},
}));

const CurrencyPicker = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		uiState: { currency, setCurrency },
	} = store;

	return (
		<Select
			variant="outlined"
			value={currency}
			onChange={(v: any) => setCurrency(v.target.value)}
			className={classes.currencyPicker}
			style={{ marginTop: 'auto', marginBottom: 'auto' }}
		>
			<MenuItem value={'usd'}>USD</MenuItem>
			<MenuItem value={'cad'}>CAD</MenuItem>
			<MenuItem value={'btc'}>BTC</MenuItem>
			<MenuItem value={'eth'}>ETH</MenuItem>
		</Select>
	);
});

export default CurrencyPicker;
