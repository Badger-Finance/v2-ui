import React from 'react';
import { Typography as MuiTypography, TypographyProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({
	helperText: {
		fontSize: 12,
		fontWeight: 400,
	},
});

type Props = TypographyProps & {
	variant: TypographyProps['variant'] | 'helperText';
};

/**
 * Typography wrapper that extends MUI Typography and adds support for custom variants.
 * @see https://github.com/mui/material-ui/issues/22257#issuecomment-776300833
 */
export const Typography = ({ variant, className, ...props }: Props): JSX.Element => {
	const classes = useStyles() as Record<string, {}>;
	const isCustom = variant ? Object.keys(classes).indexOf(variant) > -1 : false;
	const customClassName = variant ? classes[variant] : undefined;
	return (
		<MuiTypography
			className={isCustom ? clsx(customClassName, className) : className}
			variant={isCustom ? undefined : variant}
			{...props}
		>
			{props.children}
		</MuiTypography>
	);
};
