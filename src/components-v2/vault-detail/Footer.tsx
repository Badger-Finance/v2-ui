import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { BadgerVault } from '../../mobx/model/vaults/badger-vault';

const useStyles = makeStyles((theme) => ({
	vaultDescription: {
		marginBottom: theme.spacing(1),
	},
	link: {
		fontSize: 12,
		display: 'flex',
		alignItems: 'center',
	},
	openIcon: {
		fontSize: 12,
		marginLeft: 4,
	},
}));

interface Props {
	badgerVault: BadgerVault;
}

export const Footer = observer(({ badgerVault }: Props): JSX.Element => {
	const store = React.useContext(StoreContext);
	const { network: networkStore } = store;
	const { network } = networkStore;
	const classes = useStyles();

	const strategy = network.strategies[badgerVault.vaultToken.address];

	return (
		<footer>
			{strategy.description && (
				<div className={classes.vaultDescription}>
					<Typography variant="body2" color="textSecondary">
						{strategy.description}
					</Typography>
				</div>
			)}
		</footer>
	);
});
