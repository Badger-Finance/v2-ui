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
	List,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { StoreContext } from '../../mobx/store-context';
import { formatAmount } from 'mobx/reducers/statsReducers';
import useInterval from '@use-it/interval';
import Hero from 'components/Common/Hero';
import views from '../../config/routes';
import { inCurrency } from '../../mobx/utils/helpers';
import { token, digg_system, sett_system } from '../../config/deployments/mainnet.json';

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
		margin: theme.spacing(1, 1, 2, 0),
	},
	chip: {
		margin: theme.spacing(0, 0, 0, 0),
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
		router: { goTo },
		wallet: { connectedAddress },
		airdrops: { claimAirdrops },
		uiState: { airdropStats, stats },
	} = store;

	const spacer = () => <div className={classes.before} />;

	const [update, forceUpdate] = useState<boolean>();
	useInterval(() => forceUpdate(!update), 1000);

	const copy = () => {
		const q = [
			{
				title: `Stake`,
				button: `Stake`,
				badge: !!stats.stats.badgerGrowth && `Up to ${stats.stats.badgerGrowth}% APY`,
				copy: 'Deposit in vaults to earn Badger and Digg',
			},
			// { title: "Liquidity", button: "Add Liquidity", badge: !!stats.stats.badgerLiqGrowth && `Up to ${stats.stats.badgerLiqGrowth}% APY`, href: "https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859", copy: "Provide liquidity and stake LP in vaults." },
			{
				title: 'Badger Liquidity',
				button: 'Uniswap',
				button2: 'Sushiswap',
				href: 'https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859',
				href2: 'https://sushiswap.fi/pair/0x110492b31c59716ac47337e616804e3e3adc0b4a',
				copy: 'Provide liquidity and stake LP in vaults.',
			},
			{
				title: 'Digg Liquidity',
				button: 'Uniswap',
				button2: 'Sushiswap',
				href: 'https://info.uniswap.org/pair/0xE86204c4eDDd2f70eE00EAd6805f917671F56c52',
				href2: 'https://sushiswap.vision/pair/0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3',
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
			<Grid item xs={12} md={4} style={{ textAlign: 'left', marginBottom: '2rem' }} key={idx}>
				<Typography variant="h4">{qualifier.title}</Typography>

				<Typography variant="body2" color="textSecondary" style={{ margin: '.4rem 0 .5rem' }}>
					{qualifier.copy}
				</Typography>

				<Button
					className={classes.button}
					onClick={() => {
						if (!!qualifier.href) {
							window.open(qualifier.href);
						} else {
							goTo(views.home);
						}
					}}
					size="small"
					variant="contained"
					color="primary"
				>
					{qualifier.button}
				</Button>
				{!!qualifier.badge && (
					<Chip className={classes.chip} label={qualifier.badge} color="secondary" size="small" />
				)}
				{!!qualifier.button2 && (
					<Button
						className={classes.button}
						target="_blank"
						href={qualifier.href2}
						size="small"
						variant="outlined"
						color="primary"
						disableElevation
					>
						{qualifier.button2}
					</Button>
				)}
			</Grid>
		));
	};

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="flex-start">
				{spacer()}

				<Grid item sm={12} xs={12}>
					<Hero
						title="Community Rules."
						subtitle="BadgerDAO is dedicated to building products and infrastructure to bring Bitcoin to DeFi."
					/>
				</Grid>
				{spacer()}

				<Grid item xs={12}>
					<Typography variant="subtitle1" align="left">
						Available Airdrops:
					</Typography>
				</Grid>
				<Grid item xs={12} md={6}>
					<Paper className={classes.statPaper}>
						<List style={{ padding: 0 }}>
							<ListItem style={{ margin: 0, padding: 0 }}>
								<ListItemText
									primary={
										!!connectedAddress && !!airdropStats.badger
											? inCurrency(
													airdropStats.badger.amount.dividedBy(10 ** 18),
													'eth',
													true,
													18,
											  )
											: '0.00000'
									}
									secondary="Badger available to claim"
								/>
								<ListItemSecondaryAction>
									<ButtonGroup
										disabled={airdropStats.badger ? !airdropStats.badger.amount.gt(0) : true}
										size="small"
										variant="outlined"
										color="primary"
									>
										<Button
											onClick={() => {
												claimAirdrops(token);
											}}
											variant="contained"
										>
											Claim
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
								{console.log(airdropStats)}
								<ListItemText
									primary={
										!!connectedAddress && !!airdropStats.digg
											? inCurrency(airdropStats.digg.amount.dividedBy(10 ** 9), 'eth', true, 9)
											: '0.00000'
									}
									secondary="DIGG available to claim"
								/>
								<ListItemSecondaryAction>
									<ButtonGroup
										disabled={airdropStats.digg ? !airdropStats.digg.amount.gt(0) : true}
										size="small"
										variant="outlined"
										color="primary"
									>
										<Button
											onClick={() => {
												claimAirdrops(digg_system.uFragments);
											}}
											variant="contained"
										>
											Claim
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
								<ListItemText
									primary={
										!!connectedAddress && !!airdropStats.bBadger
											? inCurrency(
													airdropStats.bBadger.amount.dividedBy(10 ** 18),
													'eth',
													true,
													18,
											  )
											: '0.00000'
									}
									secondary="bBadger available to claim"
								/>
								<ListItemSecondaryAction>
									<ButtonGroup
										disabled={airdropStats.bBadger ? !airdropStats.bBadger.amount.gt(0) : true}
										size="small"
										variant="outlined"
										color="primary"
									>
										<Button
											onClick={() => {
												claimAirdrops(sett_system.vaults['native.badger']);
											}}
											variant="contained"
										>
											Claim
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
