import React from 'react';
import { Typography, makeStyles, Grid, GridJustification } from '@material-ui/core';
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
		<Grid container justify={justify} alignItems="center">
			{hasCurrencyIcon && <img src={`${icon}.png`} className={classes.currencyIcon} />}
			<Typography variant={variant}>{hasCurrencyIcon ? displayAmount : displayValue}</Typography>
		</Grid>
	);
};

export default CurrencyDisplay;
