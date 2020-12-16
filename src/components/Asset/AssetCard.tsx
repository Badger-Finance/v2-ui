import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid, Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,
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
		width: "50%",
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

	const { router: { params, goTo }, wallet: { provider }, contracts: { vaults, tokens, geysers } } = store;


	const stat = (key: any, value: any) => <div className={classes.stat}>
		<Typography color="textSecondary" variant="subtitle2">{key}</Typography>
		<Typography variant="body1">{value}</Typography>
		<img src={require("../../assets/fade.png")} className={classes.fade} />
	</div>


	if (!asset) {
		return <div />
	}

	let allowance = !!asset.allowance ? asset.allowance.div(1e18).toFixed(18) : 0
	let balance = !!asset.balanceOf ? asset.balanceOf.div(1e18).toFixed(18) : 0
	let ethValue = !!asset.ethValue ? asset.ethValue.toFixed(18) : 0
	let totalSupply = !!asset.totalSupply ? asset.totalSupply.div(1e18).toFixed(18) : 0

	return <Card >
		<CardContent className={classes.card} >
			{Object.keys(asset)
				.map((key: string) => {
					let value = asset[key]
					if (BigNumber.isBigNumber(value)) {
						value = value.div(1e18).toFixed(18)
					}
					return stat(key, value)
				})}

		</CardContent>
		<CardActions>
			<Button variant="outlined" onClick={() => { }} disabled={!provider}>increase allowance</Button>
		</CardActions>
	</Card>


});

