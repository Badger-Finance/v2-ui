import React, { useContext } from 'react';
import { map } from 'lodash';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import { OpenSeaAsset } from 'opensea-js/lib/types';
import {
	Grid, CircularProgress, Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,
	TableContainer,
	TableBody,
	Table,
	TableHead,
	TableRow,
	TableCell,
	Container,
	Button
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import BigNumber from 'bignumber.js'
import { ArrowUpward, ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({

	// root: { marginTop: theme.spacing(2) },
	stat: {
		float: "left",
		width: "33%",
		padding: theme.spacing(2, 2, 0, 0),
		wordWrap: "break-word",
		overflow: 'hidden',
		whiteSpace: "nowrap",
		position: 'relative'
	},
	card: {
		overflow: 'hidden',

		padding: theme.spacing(0, 2, 2, 2)
	},
	fade: {
		position: 'absolute',
		right: 0,
		bottom: 0
	}


}));
export const AssetCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { asset, contract } = props

	const { router: { params, goTo }, app: { collection, assets, increaseAllowance } } = store;

	const openAsset = (asset: string) => {
		goTo(views.asset, { collection: collection.config.id, id: asset })
	}

	const stat = (key: any, value: any) => <div className={classes.stat}>
		<Typography color="textSecondary" variant="subtitle2">{key}</Typography>
		<Typography variant="body1">{value}</Typography>
		<img src={require("../../assets/fade.png")} className={classes.fade} />
	</div>


	if (!asset) {
		return <div />
	}

	const allowance = !!assets[asset.address].allowance ? assets[asset.address].allowance.div(1e18).toFixed(18) : 0
	const balance = !!assets[asset.address].balanceOf ? assets[asset.address].balanceOf.div(1e18).toFixed(18) : 0
	const totalSupply = !!assets[asset.address].totalSupply ? assets[asset.address].totalSupply.div(1e18).toFixed(18) : 0

	return <Card >
		<CardActionArea onClick={() => increaseAllowance()}>
			<CardContent className={classes.card} >

				{stat('token', asset.address)}
				{stat('balance', balance)}
				{stat('allowance', allowance)}
			</CardContent>
		</CardActionArea>
	</Card>


});

