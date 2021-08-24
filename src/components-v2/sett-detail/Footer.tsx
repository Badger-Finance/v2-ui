import React from 'react';
import { Link, makeStyles, Typography } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: theme.spacing(3),
	},
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
	badgerSett: BadgerSett;
}

export const Footer = observer(
	({ badgerSett }: Props): JSX.Element => {
		const store = React.useContext(StoreContext);
		const { network: networkStore } = store;
		const { network } = networkStore;
		const classes = useStyles();

		const strategy = network.strategies[badgerSett.vaultToken.address];

		return (
			<footer className={classes.root}>
				{strategy.description && (
					<div className={classes.vaultDescription}>
						<Typography variant="body2" color="textSecondary">
							{strategy.description}
						</Typography>
					</div>
				)}
				<Link className={classes.link} href={strategy.strategyLink} rel="noreferrer" target="_blank">
					View Strategy
					<OpenInNewIcon className={classes.openIcon} />
				</Link>
			</footer>
		);
	},
);
