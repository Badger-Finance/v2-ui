import React, { forwardRef, useCallback } from 'react';
import { Button, Grid, makeStyles, Typography } from '@material-ui/core';
import { CustomContentProps, SnackbarContent, useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.common.white,
		minWidth: 288,
		maxWidth: 568,
		borderRadius: 5,
		minHeight: 48,
		padding: '6px 24px',
		[theme.breakpoints.down('md')]: {
			width: 375,
		},
		[theme.breakpoints.down('xs')]: {
			width: '100%',
		},
	},
	textContainer: {
		padding: '8px 0px',
		display: 'flex',
		alignItems: 'center',
	},
	notificationIcon: {
		paddingRight: 6,
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
		paddingLeft: 24,
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

const NotificationSnackbar = forwardRef<HTMLDivElement, CustomContentProps>((props, forwardedRef): JSX.Element => {
	const classes = useStyles();
	const { closeSnackbar } = useSnackbar();
	const { id, variant, message, action } = props;

	const notificationIcon = {
		success: 'notification-success-icon.svg',
		warning: 'notification-warning-icon.svg',
		error: 'notification-error-icon.svg',
		info: null,
		default: null,
	}[variant];

	const handleDismiss = useCallback(() => {
		closeSnackbar(id);
	}, [id, closeSnackbar]);

	return (
		<SnackbarContent ref={forwardedRef}>
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
						<Grid item className={classes.contentAction} onClick={handleDismiss}>
							<Button variant="text" className={classes.actionButton}>
								{action}
							</Button>
						</Grid>
					)}
				</Grid>
			</div>
		</SnackbarContent>
	);
});

export default NotificationSnackbar;
