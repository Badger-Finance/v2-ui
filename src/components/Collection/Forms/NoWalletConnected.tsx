import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';

interface Props {
	settName: string;
}

const useStyles = makeStyles((theme) => ({
	container: {
		paddingBottom: theme.spacing(2),
	},
	icon: {
		height: '82px',
		width: '82px',
		margin: theme.spacing(2, 0),
	},
}));

export const NoWalletConnected = ({ settName }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container direction="column" justify="center" alignItems="center" className={classes.container}>
			<Typography>{'No wallet connected.'}</Typography>
			<img src={'./assets/icons/badger_head.svg'} className={classes.icon} alt="connect wallet" />
			<Typography>{`Connect a wallet to deposit ${settName}`}</Typography>
		</Grid>
	);
};
