import React from 'react';
import { Dialog as MaterialDialog, DialogProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useCustomDialogStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.down('sm')]: {
			opacity: '0.6 !important',
			background: 'rgba(18, 18, 18) !important',
		},
	},
}));

/**
 * Custom styled Dialog that extends Material's Dialog
 */
const Dialog = ({ BackdropProps, ...props }: DialogProps): JSX.Element => {
	const classes = useCustomDialogStyles();
	const defaultBackdropClasses = BackdropProps?.classes ?? {};

	return (
		<MaterialDialog
			{...props}
			BackdropProps={{
				...BackdropProps,
				classes: { ...defaultBackdropClasses, root: clsx(defaultBackdropClasses?.root, classes.root) },
			}}
		>
			{props.children}
		</MaterialDialog>
	);
};

export default Dialog;
