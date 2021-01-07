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
			paddingLeft: theme.spacing(28),
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
export const Airdrops = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { router: { params, goTo },
		wallet: { provider },
		contracts: { claimAirdrops },
		uiState: { airdropStats, currency, period, setCurrency, setPeriod, stats } } = store;

	const spacer = () => <div className={classes.before} />;

	const copy = () => {
		let q = [
			{ title: `Stake`, button: `Stake`, badge: !!stats.stats.badgerGrowth && `Up to ${stats.stats.badgerGrowth}% APY`, href: "/setts", copy: "Deposit in vaults to earn Badger and Digg" },
			{ title: "Liquidity", button: "Add Liquidity", badge: !!stats.stats.badgerLiqGrowth && `Up to ${stats.stats.badgerLiqGrowth}% APY`, href: "https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859", copy: "Provide liquidity and stake LP in vaults." },
			{ title: "Governance", button: "Visit DAO", href: "https://forum.badger.finance/", copy: "Govern all Badger DAO products and treasury." },
		]
		return q.map((qualifier) =>
			<Grid item xs={12} sm={4} style={{ textAlign: 'left' }}>

				<Typography variant="subtitle1">
					{qualifier.title}
				</Typography>

				<Typography variant="body2" color="textSecondary" style={{ margin: ".4rem 0 1rem" }}>
					{qualifier.copy}
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
			<Grid item sm={12} xs={12}>

				<Typography variant="h5">
					BadgerDAO accelerates Bitcoin in DeFi.
				</Typography>


				<Typography variant="subtitle1" style={{ maxWidth: '40rem', margin: '1rem 0' }}>
					Badger builds products to accelerate Bitcoin in DeFi. Our core product is Sett Vault which generates automated yield for tokenized Bitcoin. Click the "Sett Vaults" tab in the sidebar or learn more about Badger DAO below.
				</Typography>

			</Grid>

			{copy()}

			{spacer()}

			<Grid item xs={12} style={{ textAlign: 'left', paddingBottom: 0 }} >
				<Typography variant="subtitle1" color="textPrimary" >Available Airdrops:</Typography>
			</Grid>

			<Grid item xs={12} md={6}>
				<Paper className={classes.statPaper}>
					<List style={{ padding: 0 }}>
						<ListItem style={{ margin: 0, padding: 0 }}>
							<ListItemText primary={airdropStats.badger} secondary="Badger available to claim" />
							<ListItemSecondaryAction >
								<ButtonGroup disabled size="small" variant="outlined" color="primary">
									<Button onClick={() => { claimAirdrops(false) }} variant="contained">Claim</Button>
									<Button onClick={() => { claimAirdrops(true) }} >Deposit</Button>
								</ButtonGroup>
							</ListItemSecondaryAction>
						</ListItem>
					</List>
				</Paper>

			</Grid>
			<Grid item xs={12} md={6}>
				<Paper className={classes.statPaper}>
					<List style={{ padding: 0 }}>
						<ListItem style={{ margin: 0, padding: 0 }}>
							<ListItemText primary={airdropStats.badger} secondary="Badger available to claim" />
							<ListItemSecondaryAction >
								<ButtonGroup disabled size="small" variant="outlined" color="primary">
									<Button onClick={() => { claimAirdrops(false) }} variant="contained">Claim</Button>
									<Button onClick={() => { claimAirdrops(true) }} >Deposit</Button>
								</ButtonGroup>
							</ListItemSecondaryAction>
						</ListItem>
					</List>
				</Paper>

			</Grid>

		</Grid >

		{spacer()}

	</Container >

});

