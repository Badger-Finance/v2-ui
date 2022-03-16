import React, { useContext } from 'react';
import { GasSpeed } from '@badger-dao/sdk';
import { makeStyles, Paper } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import MenuItem from 'ui-library/MenuItem';
import MenuItemText from 'ui-library/MenuItemText';
import Menu from 'ui-library/Menu';
import { StoreContext } from 'mobx/store-context';
import { Network } from 'mobx/model/network/network';

const useStyles = makeStyles({
	root: {
		borderRadius: 4,
		boxShadow:
			'0px 16px 24px -1px rgba(0, 0, 0, 0.14), 0px 6px 30px rgba(0, 0, 0, 0.12), 0px 8px 10px rgba(0, 0, 0, 0.2)',
	},
});

interface Props {
	network: Network;
	onSelect: () => void;
}

const GasOptions = ({ network, onSelect }: Props): JSX.Element | null => {
	const {
		gasPrices,
		uiState: { setGasPrice },
	} = useContext(StoreContext);
	const classes = useStyles();
	const gasOptions = gasPrices.getGasPrices(network.symbol);

	const handleSelection = (gasSpeed: GasSpeed) => {
		console.log(gasSpeed);
		setGasPrice(gasSpeed);
		onSelect();
	};

	if (!gasPrices.initialized || !gasOptions) {
		return null;
	}

	return (
		<Paper>
			<Menu className={classes.root}>
				{Object.entries(gasOptions).map((price) => {
					const [key, value] = price;
					const displayValue = typeof value === 'number' ? value : value.maxFeePerGas;
					return (
						<MenuItem key={`${network.id}_${key}`} button onClick={() => handleSelection(key as GasSpeed)}>
							<MenuItemText> {displayValue ? displayValue.toFixed(0) : 10}</MenuItemText>
						</MenuItem>
					);
				})}
			</Menu>
		</Paper>
	);
};

export default observer(GasOptions);
