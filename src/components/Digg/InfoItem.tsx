import { makeStyles, Typography } from '@material-ui/core';
import { darkTheme } from 'config/ui/dark';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	infoContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		[theme.breakpoints.down('sm')]: {
			padding: theme.spacing(0.5),
		},
	},
}));

export interface InfoItemProps {
	metric: string;
	children: JSX.Element | string;
}

export function InfoItem(props: InfoItemProps): JSX.Element {
	const classes = useStyles(darkTheme);
	const { metric, children } = props;
	return (
		<div className={classes.infoContainer}>
			<Typography align="center" variant="subtitle1">
				{metric}
			</Typography>
			<Typography align="center" variant="h5">
				{children}
			</Typography>
		</div>
	);
}
