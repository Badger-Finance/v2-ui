import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import {
	Tooltip,
	Card, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton, Divider, Button, Grid, ButtonGroup
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
	},
	border: {
		border: `1px solid ${theme.palette.grey[800]}`,
		marginBottom: theme.spacing(1),
		borderRadius: theme.shape.borderRadius,
		padding: theme.spacing(2, 1),
		alignItems: 'center'
	},
	featured: {
		border: 0,
		paddingTop: '30%',
		background: theme.palette.grey[800],
		borderRadius: theme.shape.borderRadius,
		boxShadow: theme.shadows[1]
	}

}));
export const VaultCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { onStake,
		onUnwrap,
		uiStats, isFeatured } = props

	const { router: { params, goTo }, contracts: { vaults, tokens }, uiState: { collection }, wallet: { provider } } = store;

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
	let anyAvailable = !!uiStats.availableBalance && parseFloat(uiStats.availableBalance) !== 0
	return <>
		<Grid container spacing={2} className={classes.border + (isFeatured ? ` ${classes.featured}` : '')}>
			<Grid item xs={12} sm={4}>
				<Grid container spacing={4}>
					<img alt=""
						src={require('../../assets/' + uiStats.symbol.toLowerCase().replace(/\/+/g, '') + '-logo.png')}
						height={'30px'}
						style={{marginTop: 'auto', marginBottom: 'auto', filter: 'saturate(25%)', paddingLeft: '.5rem'}} />
					<Grid item xs={12} sm={4} md={8}>
						<Typography variant="body1">
							{uiStats.name}
						</Typography>
					
						<Typography variant="body2" color="textSecondary">
							{uiStats.symbol}
						</Typography>
					</Grid>
				</Grid>
			</Grid>

			<Grid item xs={12} sm={4} md={2}>
				<Typography variant="body1" color={parseFloat(uiStats.underlyingBalance) === 0 ? "textSecondary" : 'textPrimary'}>

					{uiStats.underlyingBalance}
				</Typography>
				<Typography variant="body2" color="textSecondary">
					{uiStats.underlyingTokens}

				</Typography>
			</Grid>
			<Grid item xs={12} sm={4} md={2}>
				<Tooltip arrow placement="left" title={`${uiStats.geyserGrowth} + ${uiStats.vaultGrowth} ${uiStats.symbol} `}>

					<Typography variant="body1" >

						{uiStats.growth}

					</Typography>
				</Tooltip>

				<Typography variant="body2" color="textSecondary">
					{!!uiStats.vaultGrowth && '+'} {uiStats.vaultGrowth}

				</Typography>

			</Grid>
			<Grid item xs={12} sm={6} md={2}>
				<Typography variant="body1" color={!anyAvailable ? "textSecondary" : 'textPrimary'}>

					{uiStats.yourValue}
				</Typography>
				<Typography variant="body2" color="textSecondary">

					{uiStats.availableBalance}
					{!provider.selectedAddress && "..."}

				</Typography>
			</Grid>

			<Grid item xs={12} sm={6} md={2}>
				<ButtonGroup variant="outlined" style={{ float: "right" }}>
					{anyAvailable && <Button onClick={() => onStake(uiStats.address)} variant="contained" color="primary" size="small" >Stake</Button>}
					{!!uiStats.anyWrapped && <Button onClick={() => onUnwrap(uiStats.address)} variant="outlined" color="primary" size="small" className={classes.button}>Unwrap</Button>}
				</ButtonGroup>


			</Grid>
		</Grid>

	</>


});

