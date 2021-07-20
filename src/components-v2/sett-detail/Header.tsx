import React from 'react';
import { Grid, Link, makeStyles } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import GasWidget from '../common/GasWidget';
import WalletWidget from '../common/WalletWidget';

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(3),
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(8),
		},
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
		},
	},
	widgets: {
		display: 'flex',
		alignItems: 'center',
		[theme.breakpoints.down('sm')]: {
			justifyContent: 'center',
		},
	},
	backArrow: {
		marginRight: 12,
	},
	links: {
		display: 'flex',
		alignItems: 'center',
	},
}));

export const Header = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container justify="space-between" alignItems="center" className={classes.root}>
			<Link className={classes.links}>
				<ArrowBackIcon className={classes.backArrow} />
				Back to All Setts
			</Link>
			<div className={classes.widgets}>
				<GasWidget />
				<WalletWidget />
			</div>
		</Grid>
	);
};
