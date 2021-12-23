import React from 'react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Breadcrumbs, Link, makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from '../../mobx/store-context';
import { getRouteBySlug } from 'mobx/utils/helpers';
import { Vault } from '@badger-dao/sdk';

const useStyles = makeStyles({
	breadcrumbsItem: {
		fontSize: 14,
		fontWeight: 400,
	},
});

interface Props {
	vault: Vault;
}

export const Breadcrumb = ({ vault }: Props): JSX.Element => {
	const { router, vaults } = React.useContext(StoreContext);
	const classes = useStyles();
	const settSlug = router.params?.settName?.toString();

	return (
		<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
			<Link
				color="inherit"
				component="button"
				className={classes.breadcrumbsItem}
				onClick={() => router.goTo(getRouteBySlug(settSlug, vaults))}
			>
				Vaults
			</Link>
			<Typography className={classes.breadcrumbsItem} color="textSecondary">
				{vault.name}
			</Typography>
		</Breadcrumbs>
	);
};
