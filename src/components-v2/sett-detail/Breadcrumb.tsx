import React from 'react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Breadcrumbs, Link, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
	breadcrumbsItem: {
		fontSize: 14,
		fontWeight: 400,
	},
});

export const Breadcrumb = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
			<Link color="inherit" className={classes.breadcrumbsItem} href="/">
				Setts
			</Link>
			<Typography className={classes.breadcrumbsItem} color="textSecondary">
				Wrapped BTC/DIGG Sett
			</Typography>
		</Breadcrumbs>
	);
};
