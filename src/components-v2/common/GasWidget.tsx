import React, { useContext } from 'react';
import { Select, MenuItem, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { LocalGasStation } from '@material-ui/icons';
import { NETWORK_LIST } from 'config/constants';

const useStyles = makeStyles(() => ({
	gasSelector: {
		height: '2.2rem',
	},
}));

const GasWidget = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const { gasPrice, setGasPrice } = store.uiState;
	const { gasPrices, network } = store.wallet;
	const gasIcon = (
		<LocalGasStation
			onClick={() => window.open('https://www.gasnow.org/')}
			style={{ cursor: 'pointer', fontSize: '1.2rem', marginRight: '.8rem' }}
		/>
	);

	return network.name === NETWORK_LIST.ETH ? (
		<Select
			variant="outlined"
			color="secondary"
			value={gasPrice}
			onChange={(v: any) => setGasPrice(v.target.value)}
			className={classes.gasSelector}
			startAdornment={gasIcon}
		>
			<MenuItem value={'slow'}>{gasPrices['slow'].toFixed(0)}</MenuItem>
			<MenuItem value={'standard'}>{gasPrices['standard'].toFixed(0)}</MenuItem>
			<MenuItem value={'rapid'}>{gasPrices['rapid'].toFixed(0)}</MenuItem>
		</Select>
	) : (
		<> </>
	);
});

export default GasWidget;
