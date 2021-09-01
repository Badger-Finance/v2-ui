import React, { useContext } from 'react';
import { Select, MenuItem, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Currency } from 'config/enums/currency.enum';

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
		network: { network },
	} = store;

	return (
		<Select
			variant="outlined"
			value={currency}
			onChange={(v: any) => setCurrency(v.target.value)}
			className={classes.currencyPicker}
		>
			<MenuItem value={Currency.USD}>USD</MenuItem>
			<MenuItem value={Currency.CAD}>CAD</MenuItem>
			<MenuItem value={Currency.BTC}>BTC</MenuItem>
			<MenuItem value={network.currency}>{network.currency}</MenuItem>
		</Select>
	);
});

export default CurrencyPicker;
