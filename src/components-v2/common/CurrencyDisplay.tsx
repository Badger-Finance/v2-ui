import React from 'react';
import { makeStyles, GridJustification, Box, useTheme } from '@material-ui/core';
import clsx from 'clsx';
import { Typography, TypographyVariant, TypographyProps } from 'ui-library/Typography';

// this will make sure that the icon has the same size of the typography variant
const useCurrencyIconStyles = (typographyVariant: TypographyVariant) => {
	const theme = useTheme();
	// this is a workaround until we migrate to MUI v5 where we can extend typography through Typescript
	const typographyStyles = {
		...theme.typography,
		helperText: {
			fontSize: 12,
		},
	};
	const fontVariantStyles = typographyStyles[typographyVariant];

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

// TODO (TECH DEBT): replace variant and justify props for TypographyProps and ContainerProps to allow more flexibility
export interface CurrencyDisplayProps {
	displayValue?: string;
	variant: TypographyVariant;
	justifyContent: GridJustification;
	TypographyProps?: TypographyProps;
	disabled?: boolean;
}

const CurrencyDisplay = (props: CurrencyDisplayProps): JSX.Element => {
	const { displayValue, variant, justifyContent, disabled = false, TypographyProps = {} } = props;
	const [icon, displayAmount] = displayValue ? displayValue.split('.png') : [undefined, undefined];
	const hasCurrencyIcon = displayAmount !== undefined;
	const iconClasses = useCurrencyIconStyles(variant)();

	return (
		<Box display="inline-flex" justifyContent={justifyContent} alignItems="center">
			{hasCurrencyIcon && (
				<img
					alt={`${displayAmount}`}
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
