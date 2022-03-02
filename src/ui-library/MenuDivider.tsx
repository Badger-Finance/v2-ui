import React from 'react';
import { Divider, DividerProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({
	root: {
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
	},
});

const MenuDivider = (props: DividerProps): JSX.Element => {
	const classes = useStyles();
	return (
		<Divider
			{...props}
			classes={{
				...(props.classes ?? {}),
				root: clsx(classes.root, props.classes?.root),
			}}
		>
			{props.children}
		</Divider>
	);
};

export default MenuDivider;
