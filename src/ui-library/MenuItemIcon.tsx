import React from 'react';
import { ListItemIcon, ListItemIconProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({
	root: {
		marginRight: 36,
		minWidth: 0,
	},
});

const MenuItemIcon = (props: ListItemIconProps): JSX.Element => {
	const classes = useStyles();
	return (
		<ListItemIcon
			{...props}
			classes={{
				...(props.classes ?? {}),
				root: clsx(classes.root, props.classes?.root),
			}}
		>
			{props.children}
		</ListItemIcon>
	);
};

export default MenuItemIcon;
