import React, { useContext } from 'react';
import { Select, MenuItem, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { LocalGasStation } from '@material-ui/icons';
import _ from 'lodash';

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

	const getGasSelections = () => {
		console.log('lodash price:', gasPrices);
		let gasMap: any = [];

		_.each(gasPrices, (price, key) => {
			console.log('price in loop:', key, price);
			gasMap.push(
				<MenuItem value={key} key={key}>
					{price.toFixed(0)}
				</MenuItem>,
			);
		});
		return gasMap;
	};

	const gasIcon = (
		<LocalGasStation
			onClick={() => window.open('https://www.gasnow.org/')}
			style={{ cursor: 'pointer', fontSize: '1.2rem', marginRight: '.8rem' }}
		/>
	);

	return (
		<Select
			variant="outlined"
			color="secondary"
			value={gasPrice}
			onChange={(v: any) => setGasPrice(v.target.value)}
			className={classes.gasSelector}
			startAdornment={gasIcon}
		>
			{getGasSelections()}
		</Select>
	);
});

export default GasWidget;
