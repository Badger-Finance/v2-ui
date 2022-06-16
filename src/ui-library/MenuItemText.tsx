import { ListItemText, ListItemTextProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles({
	primary: {
		fontSize: 'inherit',
	},
});

const MenuItemText = (props: ListItemTextProps): JSX.Element => {
	const classes = useStyles();
	return (
		<ListItemText
			{...props}
			classes={{
				...(props.classes ?? {}),
				primary: clsx(classes.primary, props.classes?.primary),
			}}
		>
			{props.children}
		</ListItemText>
	);
};

export default MenuItemText;
