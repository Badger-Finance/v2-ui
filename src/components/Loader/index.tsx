import React from 'react';
import { CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: theme.spacing(10),
		marginBottom: theme.spacing(10),
		flexDirection: 'column',
	},
	loaderMessage: {
		marginTop: theme.spacing(5),
	},
	customSizing: {
		marginTop: theme.spacing(0),
		marginBottom: theme.spacing(0),
	},
}));

export interface LoaderProps {
	message?: string;
	size?: number;
}

export const Loader = (props: LoaderProps): JSX.Element => {
	const classes = useStyles();
	const { message, size } = props;

	return (
		<div className={clsx(classes.loaderContainer, size && classes.customSizing)}>
			<CircularProgress size={size || 60} />
			{message && (
				<Typography variant="body1" className={classes.loaderMessage}>
					{message}
				</Typography>
			)}
		</div>
	);
};
