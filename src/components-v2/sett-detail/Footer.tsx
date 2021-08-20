import React from 'react';
import { VaultDescription } from './VaultDescription';
import { Link, makeStyles } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: theme.spacing(3),
	},
	vaultDescription: {
		marginTop: theme.spacing(2),
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

export const Footer = (): JSX.Element => {
	const classes = useStyles();

	return (
		<footer className={classes.root}>
			{/*TODO: find a way to create this dynamically*/}
			<div className={classes.vaultDescription}>
				<VaultDescription />
			</div>
			<Link className={classes.link}>
				View Strategy
				<OpenInNewIcon className={classes.openIcon} />
			</Link>
		</footer>
	);
};
