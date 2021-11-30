import React from 'react';
import { Typography, makeStyles, GridJustification, Box, TypographyProps, useTheme } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';
import clsx from 'clsx';

// this will make sure that the icon has the same size of the typography variant
const useCurrencyIconStyles = (typographyVariant: Variant) => {
	const theme = useTheme();
	const fontVariantStyles = theme.typography[typographyVariant];

	return makeStyles((theme) => ({
		currencyIcon: {
			width: fontVariantStyles.fontSize as string,
			height: fontVariantStyles.fontSize as string,
			marginRight: theme.spacing(1),
		},
		disabledIcon: {
			opacity: 0.2,
		},
	}));
};

export interface CurrencyDisplayProps {
	displayValue?: string;
	variant: Variant;
	justify: GridJustification;
	TypographyProps?: TypographyProps;
	disabled?: boolean;
}

const CurrencyDisplay = (props: CurrencyDisplayProps): JSX.Element => {
	const { displayValue, variant, justify, disabled = false, TypographyProps = {} } = props;
	const [icon, displayAmount] = displayValue ? displayValue.split('.png') : [undefined, undefined];
	const hasCurrencyIcon = displayAmount !== undefined;
	const iconClasses = useCurrencyIconStyles(variant)();

	return (
		<Box display="inline-flex" justifyContent={justify} alignItems="center">
			{hasCurrencyIcon && (
				<img
					src={`${icon}.png`}
					className={clsx(iconClasses.currencyIcon, disabled && iconClasses.disabledIcon)}
				/>
			)}
			<Typography {...TypographyProps} variant={variant}>
				{hasCurrencyIcon ? displayAmount : displayValue}
			</Typography>
		</Box>
	);
};

export default CurrencyDisplay;
