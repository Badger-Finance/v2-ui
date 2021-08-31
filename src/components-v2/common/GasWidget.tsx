import React, { useContext } from 'react';
import { Select, MenuItem, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { LocalGasStation } from '@material-ui/icons';

const useStyles = makeStyles(() => ({
	gasSelector: {
		height: '2.2rem',
		overflow: 'hidden',
	},
	gasIcon: {
		cursor: 'pointer',
		fontSize: '1.2rem',
		marginRight: '.8rem',
	},
}));

const GasWidget = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const { gasPrice, setGasPrice } = store.uiState;
	const { gasPrices, network } = store.network;
	if (!gasPrices[gasPrice]) store.uiState.setGasPrice('standard');

	const getGasSelections = () => {
		const gasMap: any = [];
		for (const [key, value] of Object.entries(gasPrices)) {
			gasMap.push(
				<MenuItem value={key} key={key}>
					{value ? value.toFixed(0) : 10}
				</MenuItem>,
			);
		}
		return gasMap;
	};

	const gasIcon = (
		<LocalGasStation onClick={() => window.open(network.gasProviderUrl, '_blank')} className={classes.gasIcon} />
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
