import CurrencyInfoCard from '../components-v2/common/CurrencyInfoCard';
import CurrencyPicker from '../components-v2/landing/CurrencyPicker';
import SamplePicker from '../components-v2/landing/SamplePicker';
import WalletSlider from '../components-v2/landing/WalletSlider';
import {
	Grid,
	Container,
	makeStyles,
	ListItemText,
	Typography,
	Paper,
	List,
	ListItem,
	Button,
	ButtonGroup,
} from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';
import { digg_system } from 'config/deployments/mainnet.json';
import { CLAIMS_SYMBOLS, NETWORK_CONSTANTS } from 'config/constants';
import { inCurrency } from '../mobx/utils/helpers';
import _ from 'lodash';
import { StoreContext } from '../mobx/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import BigNumber from 'bignumber.js';
import SettList from 'components-v2/landing/SettList';
import SettStoreV2 from 'mobx/stores/settStoreV2';

const useStyles = makeStyles((theme) => ({
	landingContainer: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(30),
		},
	},
	headerContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
	marginTop: {
		marginTop: theme.spacing(3),
	},
	rewardContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
		marginLeft: 'auto',
		marginRight: 'auto',
	},
	widgetContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		height: '2.2rem',
		marginBottom: theme.spacing(1),
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: theme.spacing(3),
		},
	},
	rewardText: {
		marginRight: theme.spacing(3),
		textAlign: 'left',
	},
	statPaper: {
		padding: theme.spacing(2),
	},
	rewardItem: {
		padding: 0,
		flexWrap: 'wrap',
	},
	pickerContainer: {
		marginRight: theme.spacing(1),
	},
}));

const Landing = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		wallet: { connectedAddress, network },
		rewards: { claimGeysers, badgerTree },
		uiState: { stats, currency },
	} = store;
	const { setts } = store;
	const { protocolSummary } = setts;
	const userConnected = !!connectedAddress;

	const availableRewards = () => {
		if (!badgerTree || !badgerTree.claims) return;
		return badgerTree.claims.map((claim: any[]) => {
			const { network } = store.wallet;
			const claimAddress: string = claim[0];
			const claimValue = claim
				? claim[1].dividedBy(
						claimAddress === digg_system['uFragments']
							? badgerTree.sharesPerFragment * 1e9
							: claimAddress === NETWORK_CONSTANTS[network.name].TOKENS.USDC_ADDRESS
							? 1e6
							: 1e18,
				  )
				: claim[1];
			const claimDisplay = inCurrency(claimValue, 'eth', true);
			return (
				parseFloat(claimDisplay) > 0 && (
					<ListItemText
						key={claimAddress}
						primary={claimDisplay}
						className={classes.rewardText}
						secondary={`${CLAIMS_SYMBOLS[network.name][claimAddress]} Available to Claim`}
					/>
				)
			);
		});
	};

	const totalValueLocked = protocolSummary ? new BigNumber(protocolSummary.totalValue) : undefined;
	const badgerPrice = network.deploy ? setts.getPrice(network.deploy.token) : undefined;
	const badgerPriceDisplay = badgerPrice ? new BigNumber(badgerPrice) : undefined;
	const portfolioValue = userConnected ? stats.stats.portfolio : undefined;
	const rewards = _.compact(availableRewards());

	return (
		<Container className={classes.landingContainer}>
			{/* Landing Metrics Cards */}
			<Grid container spacing={1} justify="center">
				<Grid item xs={12} className={classes.headerContainer}>
					<PageHeader
						title="Sett Vaults"
						subtitle="Powerful Bitcoin strategies. Automatic staking rewards."
					/>
				</Grid>
				<Grid item xs={12} className={classes.widgetContainer}>
					<div>{userConnected && <WalletSlider />}</div>
					<div className={classes.pickerContainer}>
						<SamplePicker />
						<CurrencyPicker />
					</div>
				</Grid>
				<Grid item xs={12} md={userConnected ? 4 : 6}>
					<CurrencyInfoCard
						title="Total Value Locked"
						value={totalValueLocked}
						currency={currency}
						isUsd={true}
					/>
				</Grid>
				{userConnected && (
					<Grid item xs={12} md={4}>
						<CurrencyInfoCard title="Your Portfolio" value={portfolioValue} currency={currency} />
					</Grid>
				)}
				<Grid item xs={12} md={userConnected ? 4 : 6}>
					<CurrencyInfoCard title="Badger Price" value={badgerPriceDisplay} currency={currency} />
				</Grid>
			</Grid>

			{/* Landing Claim Functionality */}
			{!!network.rewards &&
				!!connectedAddress &&
				badgerTree &&
				rewards.length > 0 &&
				badgerTree.claims.length > 0 && (
					<>
						<Grid item xs={12} style={{ textAlign: 'center', paddingBottom: 0 }}>
							<Typography className={classes.marginTop} variant="subtitle1" color="textPrimary">
								Available Rewards:
							</Typography>
						</Grid>
						<Grid className={classes.rewardContainer} item xs={12} md={6}>
							<Paper className={classes.statPaper}>
								<List style={{ padding: 0, textAlign: 'center' }}>
									<ListItem className={classes.rewardItem}>{rewards}</ListItem>
									<ButtonGroup size="small" variant="outlined" color="primary">
										<Button
											className={classes.marginTop}
											onClick={() => {
												claimGeysers(false);
											}}
											variant="contained"
										>
											Claim
										</Button>
									</ButtonGroup>
								</List>
							</Paper>
						</Grid>
					</>
				)}

			<SettList />
		</Container>
	);
});

export default Landing;
