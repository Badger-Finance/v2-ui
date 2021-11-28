import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';
import { APP_NEWS_MESSAGE, APP_NEWS_URL } from 'config/constants';

const useStyles = makeStyles((theme) => ({
	root: {
		background: theme.palette.background.paper,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '16px 27px',
		[theme.breakpoints.down('sm')]: {
			padding: '12px 16px',
		},
	},
	announcement: {
		display: 'flex',
		flexGrow: 1,
		justifyContent: 'flex-end',
	},
	link: {
		display: 'flex',
		flexGrow: 1,
		justifyContent: 'flex-start',
		color: theme.palette.primary.main,
		textDecoration: 'none',
		fontWeight: 'bold',
		padding: '0px 12px',
		[theme.breakpoints.down('sm')]: {
			padding: '4px 0px 0px 0px',
		},
	},
	closeButton: {
		padding: 0,
		fontSize: 14,
		[theme.breakpoints.down('sm')]: {
			margin: theme.spacing(1),
		},
	},
	content: {
		[theme.breakpoints.up('sm')]: {
			display: 'flex',
			flexGrow: 1,
			flexDirection: 'column',
		},
	},
}));

const NewsNotification = (): JSX.Element | null => {
	const { uiState } = useContext(StoreContext);
	const classes = useStyles();

	if (!uiState.shouldShowNotification) {
		return null;
	}

	return (
		<div className={classes.root}>
			<div className={classes.content}>
				<Typography className={classes.announcement} variant="body2">
					{APP_NEWS_MESSAGE}
				</Typography>
				<a href={APP_NEWS_URL} rel="noreferrer" target="_blank" className={classes.link}>
					Learn More
				</a>
			</div>
			<IconButton className={classes.closeButton} onClick={() => uiState.closeNotification()}>
				<CloseIcon />
			</IconButton>
		</div>
	);
};

export default observer(NewsNotification);
