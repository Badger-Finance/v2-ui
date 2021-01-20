import React, { useContext } from 'react';
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
	List,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { StoreContext } from '../../mobx/store-context';

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
			textAlign: 'right',
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
		textAlign: 'center',
	},
	before: {
		marginTop: theme.spacing(5),
		width: '100%',
	},
	rewards: {
		textAlign: 'right',
	},
	button: {
		margin: theme.spacing(1, 0.5, 2, 0),
	},
	chip: {
		margin: theme.spacing(0, 0, 0, 1),
		// float: 'right'
	},
	heroPaper: {
		padding: theme.spacing(5, 0),

		minHeight: '100%',
		background: 'none',
		[theme.breakpoints.up('md')]: {
			padding: theme.spacing(10, 0),
		},
	},
}));
export const Airdrops = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const {
		router: { },
		wallet: { },
		airdrops: { claimBadgerAirdrops, claimDiggAirdrops },
		uiState: { airdropStats, stats },
	} = store;

	const spacer = () => <div className={classes.before} />;

	const copy = () => {
		const q = [
			{
				title: `Stake`,
				button: `Stake`,
				badge: !!stats.stats.badgerGrowth && `Up to ${stats.stats.badgerGrowth}% APY`,
				href: '/',
				copy: 'Deposit in vaults to earn Badger and Digg',
			},
			// { title: "Liquidity", button: "Add Liquidity", badge: !!stats.stats.badgerLiqGrowth && `Up to ${stats.stats.badgerLiqGrowth}% APY`, href: "https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859", copy: "Provide liquidity and stake LP in vaults." },
			{
				title: 'Liquidity',
				button: 'Uniswap',
				button2: 'Sushiswap',
				href: 'https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859',
				href2: 'https://sushiswap.fi/pair/0x110492b31c59716ac47337e616804e3e3adc0b4a',
				copy: 'Provide liquidity and stake LP in vaults.',
			},
			{
				title: 'Governance',
				button: 'Vote Now',
				href: 'https://snapshot.page/#/badgerdao.eth',
				copy: 'Govern all Badger DAO products and treasury.',
			},
		];
		return q.map((qualifier, idx) => (
			<Grid item xs={12} md={4} style={{ textAlign: 'left', marginBottom: '3rem' }} key={idx}>
				<Typography variant="h4">{qualifier.title}</Typography>

				<Typography variant="body2" color="textSecondary" style={{ margin: '.4rem 0 1rem' }}>
					{qualifier.copy}
				</Typography>

				<Button
					className={classes.button}
					target="_blank"
					href={qualifier.href}
					size="small"
					variant="contained"
					color="primary"
				>
					{qualifier.button}
				</Button>
				{!!qualifier.badge && (
					<Chip
						className={classes.chip}
						label={qualifier.badge}
						variant="outlined"
						color="primary"
						size="small"
					/>
				)}
				{!!qualifier.button2 && (
					<Button
						className={classes.button}
						target="_blank"
						href={qualifier.href2}
						size="small"
						variant="contained"
						color="primary"
					>
						{qualifier.button2}
					</Button>
				)}
			</Grid>
		));
	};

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="center">
				{spacer()}

				<Grid item sm={12} xs={12}>
					<div className={classes.heroPaper}>
						<Typography variant="h1" color="textPrimary" style={{ marginBottom: '.5rem' }}>
							Community rules everything.
						</Typography>
						<Typography variant="subtitle1" color="textSecondary">
							BadgerDAO is dedicated to building products and infrastructure to bring Bitcoin to DeFi.<br />
							Check below to see if you have airdrops to claim.
						</Typography>
					</div>
				</Grid>

				<Grid item xs={12} md={6}>
					<Paper className={classes.statPaper}>
						<List style={{ padding: 0 }}>
							<ListItem style={{ margin: 0, padding: 0 }}>
								<ListItemText primary={'0.00000'} secondary="Badger available to claim" />
								<ListItemSecondaryAction>
									<ButtonGroup disabled size="small" variant="outlined" color="primary">
										<Button
											onClick={() => {
												claimBadgerAirdrops(false);
											}}
											variant="contained"
										>
											Claim
										</Button>
										<Button
											onClick={() => {
												claimBadgerAirdrops(true);
											}}
										>
											Deposit
										</Button>
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
								<ListItemText primary={airdropStats.digg} secondary="DIGG available to claim" />
								<ListItemSecondaryAction>
									<ButtonGroup
										disabled={airdropStats.digg === '0.00000'}
										size="small"
										variant="outlined"
										color="primary"
									>
										<Button
											onClick={() => {
												claimDiggAirdrops(false);
											}}
											variant="contained"
										>
											Claim
										</Button>
										<Button
											onClick={() => {
												claimDiggAirdrops(true);
											}}
										>
											Deposit
										</Button>
									</ButtonGroup>
								</ListItemSecondaryAction>
							</ListItem>
						</List>
					</Paper>
				</Grid>

				{spacer()}
				{spacer()}
				{copy()}
			</Grid>

			{spacer()}
		</Container>
	);
});
