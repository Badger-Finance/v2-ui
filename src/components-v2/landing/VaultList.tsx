import React from 'react';
import { ListSubheader, makeStyles } from '@material-ui/core';
import VaultListHeader from 'components-v2/landing/VaultListHeader';
import EmptyVaultSearch from './EmptyVaultSearch';

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
}

const VaultList = ({ title, settList }: VaultTableProps): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			<ListSubheader className={classes.subHeader} disableGutters>
				<VaultListHeader
					title={title}
					helperText="A vault is a smart contract which hold specific tokens. It secures your crypto, while making your money work (e.g. rewards, APR...)"
				/>
			</ListSubheader>
			{settList.length > 0 ? settList : <EmptyVaultSearch />}
		</>
	);
};

export default VaultList;
