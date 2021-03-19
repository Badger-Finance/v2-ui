import { List } from '@material-ui/core';
import TableHeader from 'components/Collection/Setts/TableHeader';
import React from 'react';

export interface SettTableProps {
	title: string;
	tokenTitle: string;
	classes: { [name: string]: string };
	period: string;
	settList: (JSX.Element | null | undefined)[];
}

const SettTable = (props: SettTableProps): JSX.Element => {
	const { title, tokenTitle, classes, period, settList } = props;

	return (
		<>
			<TableHeader title={title} tokenTitle={tokenTitle} period={period} />
			<List className={classes.list}>{settList}</List>
		</>
	);
};

export default SettTable;
