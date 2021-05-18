import React, { useContext } from 'react';
import { Select, MenuItem, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	currencyPicker: {
		height: '1.8rem',
		overflow: 'hidden',
		marginLeft: theme.spacing(1),
		[theme.breakpoints.up('sm')]: {
			marginTop: 'auto',
			marginBottom: 'auto',
		},
	},
}));

const CurrencyPicker = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		uiState: { currency, setCurrency },
		wallet: { network },
	} = store;

	return (
		<Select
			variant="outlined"
			value={currency}
			onChange={(v: any) => setCurrency(v.target.value)}
			className={classes.currencyPicker}
		>
			<MenuItem value={'usd'}>USD</MenuItem>
			<MenuItem value={'cad'}>CAD</MenuItem>
			<MenuItem value={'btc'}>BTC</MenuItem>
			<MenuItem value={network.currency.toLowerCase()}>{network.currency}</MenuItem>
		</Select>
	);
});

export default CurrencyPicker;
