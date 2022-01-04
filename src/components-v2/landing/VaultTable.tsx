import React from 'react';
import { List, ListSubheader, makeStyles } from '@material-ui/core';
import TableHeader from 'components-v2/landing/TableHeader';

const useStyles = makeStyles((theme) => ({
	list: {
		width: '100%',
		borderRadius: theme.shape.borderRadius,
		background: `${theme.palette.background.paper}`,
		padding: 0,
	},
	subHeader: {
		background: theme.palette.background.default,
	},
}));

export interface VaultTableProps {
	title: string;
	settList: (JSX.Element | null | undefined)[];
	displayValue?: string;
}

const VaultTable = ({ title, settList, displayValue }: VaultTableProps): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			<ListSubheader className={classes.subHeader}>
				<TableHeader title={title} displayValue={displayValue} />
			</ListSubheader>
			<List className={classes.list}>{settList}</List>
		</>
	);
};

export default VaultTable;
