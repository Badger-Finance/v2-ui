import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import {
	Card, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton, Divider, Button, Grid
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import BigNumber from 'bignumber.js'

const useStyles = makeStyles((theme) => ({

	// root: { marginTop: theme.spacing(2) },
	stat: {
		float: "left",
		width: "25%",
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
	, buttons: {
		textAlign: "right"
	},
	button: {
		marginLeft: theme.spacing(1)
	}

}));
export const GeyserCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { underlying,
		contract,
		config,
		uiStats } = props

	const { router: { params, goTo }, contracts: { vaults, tokens }, uiState: { collection } } = store;

	const openVault = (asset: string) => {
		goTo(views.vault, { collection: collection.id, id: asset })
	}

	const stat = (key: any, value: any) => <div key={key} className={classes.stat}>
		<Typography color="textSecondary" variant="subtitle2">{key}</Typography>
		<Typography variant="body1">{value}</Typography>
		<img src={require("../../assets/fade.png")} className={classes.fade} />
	</div>

	if (!uiStats) {
		return <Loader />
	}

	return <>
		<Grid container spacing={2}>
			<Grid item xs={4}>
				<Typography variant="body1">
					{uiStats.name}
				</Typography>
			</Grid>
			<Grid item xs={2}>
				<Typography variant="body1">

					{uiStats.yourBalance}
				</Typography>
			</Grid>
			<Grid item xs={2}>
				<Typography variant="body1">

					{uiStats.growth}
				</Typography>

			</Grid>
			<Grid item xs={2}>
				<Typography variant="body1">

					{uiStats.yourValue}
				</Typography>

			</Grid>
			<Grid item xs={2} className={classes.buttons}>
				<Button variant="outlined" size="small" className={classes.button}>Withdraw</Button>
			</Grid>
		</Grid>

	</>


});

