import { List, makeStyles } from '@material-ui/core';

import React from 'react';
import TableHeader from 'components/Collection/Setts/TableHeader';

const useStyles = makeStyles((theme) => ({
	list: {
		width: '100%',
		borderRadius: theme.shape.borderRadius,
		overflow: 'hidden',
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1],
		marginBottom: theme.spacing(1),
	},
}));

export interface SettTableProps {
	title: string;
	tokenTitle: string;
	period: string;
	settList: (JSX.Element | null | undefined)[];
}

const SettTable = (props: SettTableProps): JSX.Element => {
	const { title, tokenTitle, period, settList } = props;
	const classes = useStyles();

	return (
		<>
			<TableHeader title={title} tokenTitle={tokenTitle} period={period} />
			<List className={classes.list}>{settList}</List>
		</>
	);
};

export default SettTable;
