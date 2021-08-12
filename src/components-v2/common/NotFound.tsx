import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: theme.spacing(10),
		marginBottom: theme.spacing(10),
		flexDirection: 'column',
	},
	image: {
		maxWidth: '100%',
	},
}));

export const NotFound = (): JSX.Element => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<img className={classes.image} src="/assets/icons/not-found-404.png" alt="not-found" />
		</div>
	);
};
