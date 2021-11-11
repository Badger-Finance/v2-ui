import React from 'react';
import { Typography, makeStyles, GridJustification, Box } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';

const useStyles = makeStyles((theme) => ({
	currencyIcon: {
		width: 20,
		height: 20,
		marginRight: theme.spacing(1),
	},
}));

export interface CurrencyDisplayProps {
	displayValue?: string;
	variant: Variant;
	justify: GridJustification;
}

const CurrencyDisplay = (props: CurrencyDisplayProps): JSX.Element => {
	const { displayValue, variant, justify } = props;
	const [icon, displayAmount] = displayValue ? displayValue.split('.png') : [undefined, undefined];
	const hasCurrencyIcon = displayAmount !== undefined;
	const classes = useStyles();

	return (
		<Box display="inline-flex" justifyContent={justify} alignItems="center">
			{hasCurrencyIcon && <img src={`${icon}.png`} className={classes.currencyIcon} />}
			<Typography variant={variant}>{hasCurrencyIcon ? displayAmount : displayValue}</Typography>
		</Box>
	);
};

export default CurrencyDisplay;
