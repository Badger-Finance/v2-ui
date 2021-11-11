import React from 'react';
import { List, makeStyles } from '@material-ui/core';
import TableHeader from 'components-v2/landing/TableHeader';

const useStyles = makeStyles((theme) => ({
	list: {
		width: '100%',
		borderRadius: theme.shape.borderRadius,
		overflow: 'auto',
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1],
		marginBottom: theme.spacing(2),
		maxHeight: '67vh',
		'&::-webkit-scrollbar': {
			backgroundColor: 'rgb(43, 43, 43)',
			borderTopRightRadius: 8,
			borderBottomRightRadius: 8,
		},
		'&::-webkit-scrollbar-corner': {
			backgroundColor: 'rgb(43, 43, 43)',
		},
		'&::-webkit-scrollbar-thumb': {
			borderRadius: 8,
			backgroundColor: 'rgb(107, 107, 107)',
			minHeight: 24,
			border: '3px solid rgb(43, 43, 43)',
		},
	},
}));

export interface SettTableProps {
	title: string;
	period: string;
	settList: (JSX.Element | null | undefined)[];
	displayValue: string | undefined;
}

const SettTable = (props: SettTableProps): JSX.Element => {
	const { title, period, settList, displayValue } = props;
	const classes = useStyles();

	return (
		<>
			<TableHeader title={title} period={period} displayValue={displayValue} />
			<List className={classes.list}>{settList}</List>
		</>
	);
};

export default SettTable;
