import React from 'react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Breadcrumbs, Link, makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from '../../mobx/store-context';
import { VaultDTO } from '@badger-dao/sdk';
import clsx from 'clsx';
import routes from '../../config/routes';

const useStyles = makeStyles({
	breadcrumbsItem: {
		fontSize: 14,
		fontWeight: 400,
	},
	link: {
		cursor: 'pointer',
		'&:hover': {
			textDecoration: 'none',
		},
	},
});

interface Props {
	vault: VaultDTO;
}

export const Breadcrumb = ({ vault }: Props): JSX.Element => {
	const { router } = React.useContext(StoreContext);
	const classes = useStyles();

	return (
		<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
			<Link
				color="inherit"
				className={clsx(classes.link, classes.breadcrumbsItem)}
				onClick={() => router.goTo(routes.home)}
			>
				Vaults
			</Link>
			<Typography className={classes.breadcrumbsItem} color="textSecondary">
				{vault.name}
			</Typography>
		</Breadcrumbs>
	);
};
