import { makeStyles, Typography } from '@material-ui/core';
import { darkTheme } from 'config/ui/dark';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	messageContainer: {
		display: 'flex',
		padding: theme.spacing(4),
		alignContent: 'center',
		justifyContent: 'center',
		[theme.breakpoints.down('sm')]: {
			padding: theme.spacing(2),
		},
	},
	connectImage: {
		width: '130px',
		height: '130px',
		[theme.breakpoints.down('sm')]: {
			width: '85px',
			height: '85px',
		},
	},
	noWalletMessage: {
		paddingLeft: theme.spacing(5),
		margin: 'auto',
		[theme.breakpoints.down('sm')]: {
			fontSize: '0.8rem',
		},
	},
}));

export interface NoWalletProps {
	message: string;
}

export default function NoWallet(props: NoWalletProps): JSX.Element {
	const classes = useStyles(darkTheme);
	const { message } = props;
	return (
		<div className={classes.messageContainer}>
			<img src={'/assets/connect_badger.png'} className={classes.connectImage} alt="Connect Badger" />
			<Typography variant="h6" align="center" className={classes.noWalletMessage}>
				{message}
			</Typography>
		</div>
	);
}
