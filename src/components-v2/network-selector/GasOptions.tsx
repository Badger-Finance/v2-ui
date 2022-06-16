import { GasPrices } from '@badger-dao/sdk';
import { GasFees } from '@badger-dao/sdk/lib/api/interfaces/gas-fees.interface';
import { makeStyles, Paper } from '@material-ui/core';
import React from 'react';
import Menu from 'ui-library/Menu';
import MenuItem from 'ui-library/MenuItem';
import MenuItemText from 'ui-library/MenuItemText';

const useStyles = makeStyles({
	root: {
		borderRadius: 4,
		boxShadow:
			'0px 16px 24px -1px rgba(0, 0, 0, 0.14), 0px 6px 30px rgba(0, 0, 0, 0.12), 0px 8px 10px rgba(0, 0, 0, 0.2)',
	},
});

interface Props {
	gasOptions: GasPrices;
	onSelect: (gas: number | GasFees) => void;
}

const GasOptions = ({ gasOptions, onSelect }: Props): JSX.Element | null => {
	const classes = useStyles();
	return (
		<Paper>
			<Menu className={classes.root}>
				{Object.entries(gasOptions).map((price, index) => {
					const [key, value] = price;
					// Blocknative EIP-1559-compliant [Gas Estimator](https://www.blocknative.com/gas-estimator) currently
					// uses the following simple heuristic to calculate the recommended Max Fee for any given Base Fee
					// and Max Priority Fee combination:
					// Max Fee = (2 * Base Fee) + Max Priority Fee
					const displayValue = typeof value === 'number' ? value : value.maxFeePerGas / 2;
					return (
						<MenuItem key={`${key}_${index}`} button onClick={() => onSelect(value)}>
							<MenuItemText> {displayValue ? displayValue.toFixed(0) : 10}</MenuItemText>
						</MenuItem>
					);
				})}
			</Menu>
		</Paper>
	);
};

export default GasOptions;
