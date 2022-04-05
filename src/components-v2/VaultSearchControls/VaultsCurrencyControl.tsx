import React from 'react';
import { Button, ButtonGroup, ButtonGroupProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { Currency } from '../../config/enums/currency.enum';

const useStyles = makeStyles({
	selected: {
		backgroundColor: '#7B7B7B4D',
	},
	button: {
		width: 50,
	},
});

interface Props extends ButtonGroupProps {
	currency: Currency;
	onCurrencyChange: (currency: Currency) => void;
}

const VaultsCurrencyControl = ({ currency, onCurrencyChange, ...muiProps }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<ButtonGroup {...muiProps} aria-label="currency selector">
			<Button
				aria-selected={currency === Currency.USD}
				className={clsx(currency === Currency.USD && classes.selected, classes.button)}
				onClick={() => onCurrencyChange(Currency.USD)}
			>
				USD
			</Button>
			<Button
				aria-selected={currency === Currency.BTC}
				className={clsx(currency === Currency.BTC && classes.selected, classes.button)}
				onClick={() => onCurrencyChange(Currency.BTC)}
			>
				BTC
			</Button>
		</ButtonGroup>
	);
};

export default VaultsCurrencyControl;
