import { makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React from 'react';
import { useContext } from 'react';

const useStyles = makeStyles((theme) => ({
	notificationContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.palette.secondary.main,
		fontSize: '1.05rem',
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2),
		borderBottom: '1px solid',
	},
	notificationLink: {
		color: theme.palette.primary.main,
		fontSize: '.90rem',
	},
}));

const AppNotification = observer((): JSX.Element | null => {
	const { network: networkStore } = useContext(StoreContext);
	const { network } = networkStore;
	const classes = useStyles();
	if (!network.notification) {
		return null;
	}
	return (
		<div className={classes.notificationContainer}>
			<span>{network.notification}</span>
			{network.notificationLink && (
				<a
					href={network.notificationLink}
					target="_blank"
					rel="noopener noreferrer"
					className={classes.notificationLink}
				>
					Read More
				</a>
			)}
		</div>
	);
});

export default AppNotification;
