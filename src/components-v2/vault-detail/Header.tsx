import { Link, makeStyles } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { StoreContext } from 'mobx/stores/store-context';
import React from 'react';

import routes from '../../config/routes';
import { PageHeaderContainer } from '../common/Containers';

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(3),
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

export const Header = (): JSX.Element => {
	const { router } = React.useContext(StoreContext);
	const classes = useStyles();

	return (
		<PageHeaderContainer container className={classes.root}>
			<Link component="button" className={classes.links} onClick={() => router.goTo(routes.home)}>
				<ArrowBackIcon className={classes.backArrow} />
				Back to All Vaults
			</Link>
		</PageHeaderContainer>
	);
};
