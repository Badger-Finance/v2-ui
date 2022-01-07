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
		paddingRight: 0,
	},
}));

export interface VaultTableProps {
	title: string;
	settList: (JSX.Element | null | undefined)[];
	displayValue?: string;
}

const VaultTable = ({ title, settList }: VaultTableProps): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			<ListSubheader className={classes.subHeader} disableGutters>
				<TableHeader title={title} />
			</ListSubheader>
			<List className={classes.list}>{settList}</List>
		</>
	);
};

export default VaultTable;
