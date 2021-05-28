import React from 'react';
import { CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

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
}));

export interface LoaderProps {
	message?: string;
}

export const Loader = (props: LoaderProps): JSX.Element => {
	const classes = useStyles();
	const { message } = props;

	return (
		<div className={classes.loaderContainer}>
			<CircularProgress size={60} />
			{message && (
				<Typography variant="body1" className={classes.loaderMessage}>
					{message}
				</Typography>
			)}
		</div>
	);
};
