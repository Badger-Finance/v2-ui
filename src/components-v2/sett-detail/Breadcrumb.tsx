import React from 'react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Breadcrumbs, Link, makeStyles, Typography } from '@material-ui/core';
import { Sett } from '../../mobx/model/setts/sett';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';

const useStyles = makeStyles({
	breadcrumbsItem: {
		fontSize: 14,
		fontWeight: 400,
	},
});

interface Props {
	sett: Sett;
}

export const Breadcrumb = ({ sett }: Props): JSX.Element => {
	const { router } = React.useContext(StoreContext);
	const classes = useStyles();

	return (
		<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
			<Link
				color="inherit"
				component="button"
				className={classes.breadcrumbsItem}
				onClick={() => router.goTo(routes.home)}
			>
				Setts
			</Link>
			<Typography className={classes.breadcrumbsItem} color="textSecondary">
				{sett.name}
			</Typography>
		</Breadcrumbs>
	);
};
