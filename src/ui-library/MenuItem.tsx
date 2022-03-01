import React from 'react';
import { ListItem, ListItemProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({
	button: {
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.15)',
		},
		'&:disabled': {
			color: 'rgba(255, 255, 255, 0.15)',
		},
	},
});

//https://github.com/mui/material-ui/issues/14971#issuecomment-616791594
interface CustomMenuItemProps extends ListItemProps {
	button?: any;
}

const MenuItem = (props: CustomMenuItemProps): JSX.Element => {
	const classes = useStyles();
	return (
		<ListItem
			{...props}
			classes={{
				...(props.classes ?? {}),
				button: clsx(classes.button, props.classes?.button),
			}}
		>
			{props.children}
		</ListItem>
	);
};

export default MenuItem;
