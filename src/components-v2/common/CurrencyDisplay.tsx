import React from 'react';
import { Typography, makeStyles, GridJustification, Box } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	currencyIcon: {
		width: 20,
		height: 20,
		marginRight: theme.spacing(1),
	},
	disabledIcon: {
		opacity: 0.2,
	},
}));

export interface CurrencyDisplayProps {
	displayValue?: string;
	variant: Variant;
	justify: GridJustification;
	disabled?: boolean;
}

const CurrencyDisplay = (props: CurrencyDisplayProps): JSX.Element => {
	const { displayValue, variant, justify, disabled = false } = props;
	const [icon, displayAmount] = displayValue ? displayValue.split('.png') : [undefined, undefined];
	const hasCurrencyIcon = displayAmount !== undefined;
	const classes = useStyles();

	return (
		<Box display="inline-flex" justifyContent={justify} alignItems="center">
			{hasCurrencyIcon && (
				<img src={`${icon}.png`} className={clsx(classes.currencyIcon, disabled && classes.disabledIcon)} />
			)}
			<Typography variant={variant}>{hasCurrencyIcon ? displayAmount : displayValue}</Typography>
		</Box>
	);
};

export default CurrencyDisplay;
