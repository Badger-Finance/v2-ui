import React from 'react';
import { ListSubheader, ListSubheaderProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({
	root: {
		color: 'rgba(255, 255, 255, 0.6)',
		fontSize: 14,
		fontWeight: 400,
	},
	sticky: {
		backgroundColor: '#3a3a3a',
	},
});

const MenuSubheader = (props: ListSubheaderProps): JSX.Element => {
	const classes = useStyles();
	return (
		<ListSubheader
			{...props}
			classes={{
				...(props.classes ?? {}),
				root: clsx(classes.root, props.classes?.root),
				sticky: clsx(classes.sticky, props.classes?.sticky),
			}}
		>
			{props.children}
		</ListSubheader>
	);
};

export default MenuSubheader;
