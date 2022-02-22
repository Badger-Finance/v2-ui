import React from 'react';
import { Button, Grid, makeStyles, Typography } from '@material-ui/core';

export interface NotificationSnackbarProps {
	message: string;
	type: 'info' | 'success' | 'warning' | 'error';
	onActionClick?: () => void;
	action?: string | React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.common.white,
		maxWidth: 568,
		borderRadius: 5,
		minHeight: 48,
		padding: '6px 24px',
		[theme.breakpoints.down('md')]: {
			maxWidth: 375,
		},
	},
	textContainer: {
		padding: '8px 0px',
		display: 'flex',
		alignItems: 'center',
	},
	notificationIcon: {
		paddingRight: 6,
		[theme.breakpoints.down('md')]: {
			paddingRight: 20,
		},
	},
	text: {
		display: 'inline-block',
		fontSize: 14,
		fontWeight: 400,
		letterSpacing: 0.25,
		color: 'rgba(0, 0, 0, 0.6)',
	},
	contentAction: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginLeft: 'auto',
		paddingLeft: 48,
	},
	actionButton: {
		height: 'auto',
		padding: '4px 5px',
		textTransform: 'uppercase',
		color: '#ED7E1D',
		fontWeight: 500,
		fontSize: 14,
		letterSpacing: 1.25,
	},
}));

const NotificationSnackbar = ({ message, action, type, onActionClick }: NotificationSnackbarProps): JSX.Element => {
	const classes = useStyles();

	const notificationIcon = {
		success: 'notification-success-icon.svg',
		warning: 'notification-warning-icon.svg',
		error: 'notification-error-icon.svg',
		info: null,
	}[type];

	return (
		<div className={classes.root}>
			<Grid container alignItems="center">
				<Grid item className={classes.textContainer}>
					{notificationIcon && (
						<img
							className={classes.notificationIcon}
							src={`assets/icons/${notificationIcon}`}
							alt="notification-icon"
						/>
					)}
					<Typography variant="body2" className={classes.text}>
						{message}
					</Typography>
				</Grid>
				{action && (
					<Grid item className={classes.contentAction}>
						<Button variant="text" className={classes.actionButton} onClick={onActionClick}>
							{action}
						</Button>
					</Grid>
				)}
			</Grid>
		</div>
	);
};

export default NotificationSnackbar;
