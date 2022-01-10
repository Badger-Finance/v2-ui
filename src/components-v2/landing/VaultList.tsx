import React from 'react';
import { ListSubheader, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
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
	settList: JSX.Element[];
	displayValue?: string;
}

const VaultList = ({ title, settList }: VaultTableProps): JSX.Element => {
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const classes = useStyles();

	if (isMobile) {
		return (
			<>
				<ListSubheader className={classes.subHeader} disableGutters>
					<TableHeader title={title} />
				</ListSubheader>
				{settList}
			</>
		);
	}

	return (
		<>
			<ListSubheader className={classes.subHeader} disableGutters>
				<TableHeader title={title} />
			</ListSubheader>
			{settList}
		</>
	);
};

export default VaultList;
