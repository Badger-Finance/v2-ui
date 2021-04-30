import { List, makeStyles, Typography } from '@material-ui/core';
import TableHeader from 'components/Collection/Setts/TableHeader';
import React from 'react';

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
	displayValue: string;
	experimental: boolean;
}

const SettTable = (props: SettTableProps): JSX.Element => {
	const { title, tokenTitle, period, settList, displayValue, experimental } = props;
	const classes = useStyles();

	if (experimental && settList.length === 0)
		return (
			<Typography align="center" variant="subtitle1" color="textSecondary">
				There are currently no experimental vaults. Check back to ape later.
			</Typography>
		);

	return (
		<>
			<TableHeader title={title} tokenTitle={tokenTitle} period={period} displayValue={displayValue} />
			<List className={classes.list}>{settList}</List>
		</>
	);
};

export default SettTable;
