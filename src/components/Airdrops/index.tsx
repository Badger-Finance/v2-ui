import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import {
	Grid,
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
import views from '../../config/routes';
import PageHeader from '../../components-v2/common/PageHeader';
import { getToken } from 'web3/config/token-config';
import { formatTokens } from 'mobx/utils/helpers';
import { HeaderContainer, LayoutContainer } from '../../components-v2/common/Containers';

const useStyles = makeStyles((theme) => ({
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
	button: {
		margin: theme.spacing(1, 1, 2, 0),
	},
	chip: {
		margin: theme.spacing(0, 0, 0, 0),
	},
}));

export const Airdrops = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const {
		router: { goTo },
		wallet: { connectedAddress },
		airdrops: { claimAirdrops, airdrops },
		setts: { settMap },
	} = store;

	let maxNativeApy: number | undefined = undefined;
	if (settMap && settMap.digg && settMap.badger) {
		const diggApy = settMap.digg.apr;
		const badgerApy = settMap.badger.apr;
		maxNativeApy = Math.max(diggApy, badgerApy);
	}

	const spacer = () => <div className={classes.before} />;

	const copy = () => {
		const q = [
			{
				title: `Stake`,
				button: `Stake`,
				badge: !!maxNativeApy && `Up to ${maxNativeApy.toFixed(2)}% APY`,
				copy: 'Deposit in vaults to earn Badger and Digg',
			},
			// { title: "Liquidity", button: "Add Liquidity", badge: !!stats.stats.badgerLiqGrowth && `Up to ${stats.stats.badgerLiqGrowth}% APY`, href: "https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859", copy: "Provide liquidity and stake LP in vaults." },
			{
				title: 'Badger Liquidity',
				button: 'Uniswap',
				button2: 'Sushiswap',
				href: 'https://v2.info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859',
				href2: 'https://analytics.sushi.com/pairs/0x110492b31c59716ac47337e616804e3e3adc0b4a',
				copy: 'Provide liquidity and stake LP in vaults.',
			},
			{
				title: 'Digg Liquidity',
				button: 'Uniswap',
				button2: 'Sushiswap',
				href: 'https://v2.info.uniswap.org/pair/0xE86204c4eDDd2f70eE00EAd6805f917671F56c52',
				href2: 'https://analytics.sushi.com/pairs/0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3',
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
					aria-label={qualifier.button}
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
						aria-label={qualifier.button2}
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

	const _airdrops = () => {
		if (!airdrops || airdrops.length === 0) {
			return <Typography>Your address has no airdrops to claim.</Typography>;
		}
		return airdrops.map((airdrop) => {
			const token = getToken(airdrop.token);
			if (!token) {
				return null;
			}
			const { amount } = airdrop;
			const dispalyAmount = !!connectedAddress ? formatTokens(amount, token.decimals) : '0.00000';

			return (
				<ListItem key={airdrop.token} style={{ margin: 0, padding: 0 }}>
					<ListItemText primary={dispalyAmount} secondary={`${token.name} available to claim`} />
					<ListItemSecondaryAction>
						<ButtonGroup disabled={!airdrop.amount.gt(0)} size="small" variant="outlined" color="primary">
							<Button
								aria-label="Claim"
								onClick={() => {
									claimAirdrops(airdrop.airdropContract, airdrop.airdropAbi, airdrop.proof);
								}}
								variant="contained"
							>
								Claim
							</Button>
						</ButtonGroup>
					</ListItemSecondaryAction>
				</ListItem>
			);
		});
	};

	return (
		<LayoutContainer>
			<Grid container spacing={1} justify="flex-start">
				<HeaderContainer item xs={12}>
					<PageHeader
						title="Community Rules."
						subtitle="BadgerDAO is dedicated to building products and infrastructure to bring Bitcoin to DeFi."
					/>
				</HeaderContainer>
				<Grid item xs={12}>
					<Typography variant="subtitle1" align="left">
						Available Airdrops:
					</Typography>
				</Grid>
				<Grid item xs={12} md={6}>
					<Paper className={classes.statPaper}>
						<List style={{ padding: 0 }}>
							{/* Airdrop List */}
							{_airdrops()}
						</List>
					</Paper>
				</Grid>

				{spacer()}
				{spacer()}
				{copy()}
			</Grid>

			{spacer()}
		</LayoutContainer>
	);
});
