import React from 'react';
import { List, makeStyles } from '@material-ui/core';
import TableHeader from 'components-v2/landing/TableHeader';

const useStyles = makeStyles((theme) => ({
	list: {
		maxHeight: `calc(100vh - 142px)`,
		width: '100%',
		borderRadius: theme.shape.borderRadius,
		overflow: 'auto',
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1],
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
}));

export interface SettTableProps {
	title: string;
	settList: (JSX.Element | null | undefined)[];
	displayValue?: string;
}

const SettTable = ({ title, settList, displayValue }: SettTableProps): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			<TableHeader title={title} displayValue={displayValue} />
			<List className={classes.list}>{settList}</List>
		</>
	);
};

export default SettTable;
