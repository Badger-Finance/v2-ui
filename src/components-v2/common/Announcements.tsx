import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';
import { APP_NEWS_MESSAGE, APP_NEWS_URL, APP_NEWS_URL_TEXT } from '../../config/constants';

const useStyles = makeStyles((theme) => ({
	root: {
		background: theme.palette.background.paper,
		width: '100%',
		padding: '15px 0',
		whiteSpace: 'pre-wrap',
	},
	link: {
		color: theme.palette.primary.main,
		textDecoration: 'none',
		fontWeight: 'bold',
		marginLeft: theme.spacing(0.25),
	},
	closeButton: {
		padding: 0,
		fontSize: 14,
		marginLeft: 12,
		position: 'absolute',
		right: theme.spacing(2),
	},
	content: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '80%',
		margin: 'auto',
		[theme.breakpoints.down('xs')]: {
			width: '60%',
			margin: 'auto',
			textAlign: 'center',
		},
	},
}));

const Announcements = (): JSX.Element | null => {
	const { uiState } = useContext(StoreContext);
	const classes = useStyles();

	if (!uiState.shouldShowNotification) {
		return null;
	}

	return (
		<div id="app-notification" className={classes.root}>
			<div className={classes.content}>
				<Typography variant="body2">
					{APP_NEWS_MESSAGE}{' '}
					<a href={APP_NEWS_URL} rel="noreferrer" target="_blank" className={classes.link}>
						{APP_NEWS_URL_TEXT}
					</a>
				</Typography>
				<IconButton className={classes.closeButton} onClick={() => uiState.closeNotification()}>
					<CloseIcon />
				</IconButton>
			</div>
		</div>
	);
};

export default observer(Announcements);
