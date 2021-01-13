import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
	Grid,
	Container,
	ButtonGroup,
	Button,
	Paper,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Chip,
	Card,
	CardContent,
	CardActionArea,
	Dialog,
	DialogTitle,
	List,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import Carousel from 'react-material-ui-carousel'
import { Loader } from '../Loader';
import { StoreContext } from '../../context/store-context';

const useStyles = makeStyles((theme) => ({

	root: {
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	filters: {
		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'right'
		},
	},
	buttonGroup: {
		marginRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			marginLeft: theme.spacing(2),
		},
	},

	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center'
	},
	before: {
		marginTop: theme.spacing(3),
		width: "100%"
	},
	rewards: {
		textAlign: 'right'
	},
	button: {
		margin: theme.spacing(1.5, 0, 2)
	},
	chip: {
		margin: theme.spacing(0, 0, 0, 1)
		// float: 'right'
	}

}));
export const Lplinks = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const spacer = () => <div className={classes.before} />;


	const copy = () => {
		let q = [
			{ title: `BADGER/WBTC`, button: `BADGER/WBTC`, badge: `Sushiswap dual-asset`, href: "https://exchange.sushiswapclassic.org/#/add/0x3472A5A71965499acd81997a54BBA8D852C6E53d/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
			{ title: `BADGER/WBTC`, button: `BADGER/WBTC`, badge: `Uniswap dual-asset`, href: "https://app.uniswap.org/#/add/0x3472A5A71965499acd81997a54BBA8D852C6E53d/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
           // { title: `BADGER/WBTC`, button: `BADGER/WBTC`, badge: `Sushiswap single-asset`, href: "Link to Zapper invest page" },
		   // { title: `BADGER/WBTC`, button: `BADGER/WBTC`, badge: `Uniswap single-asset`, href: "Link to Zapper invest page" },
			{ title: `WBTC/ETH`, button: `WBTC/ETH`, badge: `Sushiswap dual-asset`, href: "https://exchange.sushiswapclassic.org/#/add/ETH/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
			{ title: `crv:renBTC`, button: `crv:renBTC`, badge: `Curve`, href: "https://www.curve.fi/ren/deposit" },
			{ title: `crv:sBTC`, button: `crv:sBTC`, badge: `Curve`, href: "https://www.curve.fi/sbtc/deposit" },
			{ title: `crv:tBTC`, button: `crv:tBTC`, badge: `Curve`, href: "https://www.curve.fi/tbtc/deposit" },
		]
		return q.map((qualifier) =>
			<Grid item xs={12} lg={4} style={{ textAlign: 'left' }}>

				<Typography variant="subtitle1">
					{qualifier.title}
				</Typography>

				<Button target="_blank" href={qualifier.href} size="small" variant="contained" color="primary">{qualifier.button}</Button>
				{!!qualifier.badge && <Chip className={classes.chip} label={qualifier.badge} variant="outlined" color="primary" size="small" />}

			</Grid>
		)
	}

	return <Container className={classes.root}>
		<Grid container spacing={2} justify="center">

			{spacer()}
			{spacer()}
			<Grid item md={12} xs={12}>

				<Typography variant="h5">
					Links to Liqudity Pools required for Sett Deposits
				</Typography>


				<Typography variant="subtitle1" style={{ margin: '1rem 0' }}>
					Deposit your Bitcoin and other assets into Sushiswap, Uniswap and Curve
				</Typography>

			</Grid>

			{copy()}

			{spacer()}
		</Grid>

		{spacer()}

	</Container >

});

