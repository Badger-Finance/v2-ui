import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	messageContainer: {
		paddingTop: theme.spacing(8),
		textAlign: 'center',
	},
	titleText: {
		paddingBottom: theme.spacing(2),
	},
	linkContainer: {
		paddingTop: theme.spacing(2),
	},
}));

interface Props {
	network: string;
}

export default function NoVaults({ network }: Props): JSX.Element {
	const classes = useStyles();

	return (
		<div className={classes.messageContainer}>
			<img src={'/assets/icons/builder.png'} alt="Badger Builder" />
			<Typography
				className={classes.titleText}
				variant="h4"
			>{`There are currently no vaults on ${network}.`}</Typography>
			<Typography variant="h6">Check our other zones for more potential vaults</Typography>
		</div>
	);
}
