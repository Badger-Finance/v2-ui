import React from 'react';
import clsx from 'clsx';
import {
	Typography as MuiTypography,
	TypographyProps as MuiTypographyProps,
	makeStyles,
	TypographyVariant as MuiTypographyVariant,
} from '@material-ui/core';

const useStyles = makeStyles({
	helperText: {
		fontSize: 12,
		fontWeight: 400,
	},
});

export type TypographyVariant = MuiTypographyVariant | 'helperText';

export interface TypographyProps extends Omit<MuiTypographyProps, 'variant'> {
	variant?: TypographyVariant;
}

/**
 * Typography wrapper that extends MUI Typography and adds support for custom variants.
 * TODO: upgrade to MUI v5 to add custom variants through Typescript
 * @see https://github.com/mui/material-ui/issues/22257#issuecomment-776300833
 */
export const Typography = ({ variant, className, ...props }: TypographyProps): JSX.Element => {
	const classes = useStyles() as Record<string, {}>;
	const isCustom = variant ? Object.keys(classes).indexOf(variant) > -1 : false;
	const customClassName = variant ? classes[variant] : undefined;
	return (
		<MuiTypography
			className={isCustom ? clsx(customClassName, className) : className}
			variant={(isCustom ? 'inherit' : variant) as MuiTypographyVariant}
			{...props}
		>
			{props.children}
		</MuiTypography>
	);
};
