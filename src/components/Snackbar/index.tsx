import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import { StoreContext } from '../../context/store-context';
import { SnackbarProvider } from 'notistack';

const useStyles = makeStyles((theme) => ({

	success: {
		backgroundColor: theme.palette.success.main + ' !important',
		color: theme.palette.success.contrastText + ' !important'
	},
	error: {
		backgroundColor: theme.palette.error.main + ' !important',
		color: theme.palette.error.contrastText + ' !important'
	},
	warning: {
		backgroundColor: theme.palette.warning.main + ' !important',
		color: theme.palette.warning.contrastText + ' !important'
	},
	info: {
		backgroundColor: theme.palette.info.main + ' !important',
		color: theme.palette.info.contrastText + ' !important'
	},

}));
export const Snackbar = observer((props: any) => {
	const classes = useStyles();

	return <SnackbarProvider maxSnack={5} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		classes={{
			variantSuccess: classes.success,
			variantError: classes.error,
			variantWarning: classes.warning,
			variantInfo: classes.info,
		}}>{props.children}</SnackbarProvider>


});

