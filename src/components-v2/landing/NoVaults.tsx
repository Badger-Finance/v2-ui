import { makeStyles, Typography } from '@material-ui/core';
import { SettState } from 'mobx/model';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	messageContainer: {
		paddingTop: theme.spacing(8),
		textAlign: 'center',
	},
}));

export default function NoVaults(props: { state: SettState; network: string }): JSX.Element {
	const classes = useStyles();
	const { state, network } = props;
	return (
		<div className={classes.messageContainer}>
			<img src={'/assets/icons/builder.png'} />
			<Typography variant="h4">{`There are currently no ${state} vaults on ${network}.`}</Typography>
		</div>
	);
}
