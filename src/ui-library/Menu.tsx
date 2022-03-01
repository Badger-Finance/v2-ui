import React from 'react';
import { List, ListProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({
	root: {
		background: '#3a3a3a',
		color: 'rgba(255, 255, 255, 0.87)',
		fontSize: 16,
		fontWeight: 400,
	},
});

const Menu = (props: ListProps): JSX.Element => {
	const classes = useStyles();
	return (
		<List
			component="nav"
			{...props}
			classes={{
				...(props.classes ?? {}),
				root: clsx(classes.root, props.classes?.root),
			}}
		>
			{props.children}
		</List>
	);
};

export default Menu;
