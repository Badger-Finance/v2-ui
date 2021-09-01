import React from 'react';
import { Grid, Link, makeStyles } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import GasWidget from '../common/GasWidget';
import WalletWidget from '../common/WalletWidget';
import { HeaderContainer } from '../common/Containers';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import SettStore from 'mobx/stores/SettStore';
import { SettState } from 'mobx/model/setts/sett-state';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(8),
		},
	},
	widgets: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(3),
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

const getRouteBySlug = (slug: string | undefined, setts: SettStore) => {
	const sett = slug ? setts.getSettBySlug(slug) : null;
	if (!slug || !sett) return routes.home;

	switch (sett.state) {
		case SettState.Guarded:
			return routes.guarded;
		case SettState.Experimental:
			return routes.experimental;
		default:
			return routes.home;
	}
};

export const Header = (): JSX.Element => {
	const { router, setts } = React.useContext(StoreContext);
	const classes = useStyles();
	const settSlug = router.params?.settName?.toString();

	return (
		<HeaderContainer container className={classes.root}>
			<Grid item xs={12} sm={6}>
				<Link
					component="button"
					className={classes.links}
					onClick={() => router.goTo(getRouteBySlug(settSlug, setts))}
				>
					<ArrowBackIcon className={classes.backArrow} />
					Back to All Setts
				</Link>
			</Grid>
			<Grid item xs={12} sm={6} className={classes.widgets}>
				<GasWidget />
				<WalletWidget />
			</Grid>
		</HeaderContainer>
	);
};
