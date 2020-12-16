import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	root: {
		width: "100%",
		height: "100vh",
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	}

}));
export const Loader = () => {
	const classes = useStyles();

	return <div className={classes.root}><CircularProgress /></div>


}

