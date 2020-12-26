import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid, Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton, TextField,
	Button
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { BigNumber } from 'bignumber.js'
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

	const { router: { params, goTo }, wallet: { walletState }, contracts: { vaults, tokens, geysers, batchDeposit, batchWithdraw } } = store;

	const deposit = () => {
		batchDeposit(asset.address)
	}
	const withdraw = () => {
		batchWithdraw(asset.address)
	}

	const stat = (key: any, value: any) => <div key={key} className={classes.stat}>
		<Typography color="textSecondary" variant="subtitle2">{key}</Typography>
		<Typography variant="body1">{value}</Typography>
		<img src={require("../../assets/fade.png")} className={classes.fade} />
	</div>


	if (!asset) {
		return <div />
	}
	return <Card >
		<CardContent className={classes.card} >
			{Object.keys(asset).filter((key: any) => ["name", "balanceOf", "ethValue"].includes(key))
				.map((key: string) => {
					let value = asset[key]
					if (BigNumber.isBigNumber(value)) {
						value = value.div(1e18).toFixed(18)
					}
					return stat(key, value)
				})}


		</CardContent>
		{!!walletState?.address && <CardActions>
			{/* <TextField placeholder="amount"></TextField> */}
			<Button variant="outlined" onClick={deposit} disabled={!walletState}>deposit</Button>
			{/* <TextField placeholder="amount"></TextField> */}

			<Button variant="outlined" onClick={withdraw} disabled={!walletState}>withdraw</Button>
		</CardActions>}
	</Card>


});

