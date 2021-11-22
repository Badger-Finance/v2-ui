import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	root: {
		background: '#6B6B6B',
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
	},
}));

const NewsNotification = (): JSX.Element | null => {
	const { uiState } = useContext(StoreContext);
	const classes = useStyles();

	if (!uiState.shouldShowNotification) {
		return null;
	}

	return (
		<Grid id="app-notification" container alignItems="center" justify="center" className={classes.root}>
			<Typography variant="body2">{'🎉 Badger Boost Power has been implemented. '}</Typography>
			<a
				href="https://badger.com/news/single-chain-boost"
				rel="noreferrer"
				target="_blank"
				className={classes.link}
			>
				Learn More
			</a>
			<IconButton className={classes.closeButton} onClick={() => uiState.closeNotification()}>
				<CloseIcon />
			</IconButton>
		</Grid>
	);
};

export default observer(NewsNotification);
