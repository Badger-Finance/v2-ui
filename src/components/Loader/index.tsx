import React, { useContext } from 'react';
import { map } from 'lodash';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import { OpenSeaAsset } from 'opensea-js/lib/types';
import { Grid, CircularProgress, Avatar } from '@material-ui/core';
import { Typography } from '@material-ui/core';
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
	const store = useContext(StoreContext);
	const classes = useStyles();

	return <div className={classes.root}><CircularProgress /></div>


}

