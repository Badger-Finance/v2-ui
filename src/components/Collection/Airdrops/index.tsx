import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
	Grid,
	Container,
	ButtonGroup,
	Button,
	Paper,
	Chip,
	Card,
	CardContent,
	CardActionArea,
	Dialog,
	DialogTitle,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import Carousel from 'react-material-ui-carousel'
import { Loader } from '../../Loader';
import { StoreContext } from '../../../context/store-context';

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
		// float: 'right'
		margin: theme.spacing(2, 0, 0, 'auto')
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
			{ title: `Stake`, button: `Stake`, badge: !!stats.badgerGrowth && `Up to ${stats.badgerGrowth}% APY`, href: "/setts", copy: "Deposit in vaults to earn Badger and Digg" },
			{ title: "Liquidity", button: "Add Liquidity", badge: !!stats.badgerLiqGrowth && `Up to ${stats.badgerLiqGrowth}% APY`, href: "https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859", copy: "Provide liquidity and stake LP in vaults." },
			{ title: "Governance", button: "Visit DAO", href: "https://forum.badger.finance/", copy: "Govern all Badger DAO products and treasury." },
		]
		return q.map((qualifier) => <Grid item xs={12} md={4}>
			<Card>
				<CardActionArea target="_blank" href={qualifier.href}>
					<CardContent>
						<Typography variant="body1">
							{qualifier.title}
						</Typography>

						<Typography variant="body2" color="textSecondary" style={{ marginTop: ".4rem" }}>
							{qualifier.copy}
						</Typography>
						{!!qualifier.badge && <Chip className={classes.chip} label={qualifier.badge} color="primary" size="small" />}

					</CardContent>
				</CardActionArea>
			</Card>

		</Grid>)
	}

	return <Container className={classes.root} >
		<Grid container spacing={2}>
			{spacer()}

			<Grid item xs={12} >
				<Typography variant="h5" color="textPrimary" >Airdrops</Typography>
				<Typography variant="subtitle2" color="textPrimary" >Claim DIGG and Badger</Typography>
			</Grid>

			<Grid item xs={12}>
				<Paper className={classes.statPaper} variant="outlined" style={{ textAlign: 'left' }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<div>
							<Typography variant="subtitle1" color="textPrimary">Badger Available</Typography>
							<Typography variant="h5">{airdropStats.badger}</Typography>
						</div>
						<div>

							<ButtonGroup variant="outlined" disabled={!airdropStats.anyAvailable} size="small" className={classes.rewards}>
								<Button color="primary" onClick={() => { claimAirdrops(false) }}>Claim</Button>
								<Button color="primary" onClick={() => { claimAirdrops(true) }}>Claim & Stake</Button>
							</ButtonGroup>
						</div>
					</div>
				</Paper>

			</Grid>
			<Grid item xs={12}>
				<Paper className={classes.statPaper} variant="outlined" style={{ textAlign: 'left' }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<div>
							<Typography variant="subtitle1" color="textPrimary">Digg Available</Typography>
							<Typography variant="h5">{airdropStats.badger}</Typography>
						</div>
						<div>
							<ButtonGroup variant="outlined" disabled={!airdropStats.anyAvailable} size="small" className={classes.rewards}>
								<Button color="primary" onClick={() => { claimAirdrops(false) }}>Claim</Button>
								<Button color="primary" onClick={() => { claimAirdrops(true) }}>Claim & Stake</Button>
							</ButtonGroup>						</div>

					</div>
				</Paper>

			</Grid>
			{spacer()}
			<Grid item xs={12}>

				<Typography variant="body2">
					Badger builds products to accelerate Bitcoin in DeFi. Our core product is Sett Vault which generates automated yield for tokenized Bitcoin. Click the "Sett Vaults" tab in the sidebar or learn more about Badger DAO below.
				</Typography>

			</Grid>


			{copy()}

			{spacer()}

		</Grid >


	</Container >

});

