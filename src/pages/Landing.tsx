import CurrencyInfoCard from '../components-v2/common/CurrencyInfoCard';
import CurrencyPicker from '../components-v2/landing/CurrencyPicker';
import SamplePicker from '../components-v2/landing/SamplePicker';
import WalletSlider from '../components-v2/landing/WalletSlider';
import { Grid, Container, makeStyles } from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';
import { StoreContext } from '../mobx/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import BigNumber from 'bignumber.js';
import SettList from 'components-v2/landing/SettList';
import RewardsModal from '../components-v2/landing/RewardsModal';

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
		display: 'flex',
		marginRight: theme.spacing(1),
	},
}));

const Landing = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		wallet: { connectedAddress, network },
		rewards: { badgerTree },

		uiState: { stats, currency },
	} = store;
	const { setts } = store;
	const { protocolSummary } = setts;
	const userConnected = !!connectedAddress;

	const totalValueLocked = protocolSummary ? new BigNumber(protocolSummary.totalValue) : undefined;
	const badgerPrice = network.deploy ? setts.getPrice(network.deploy.token) : undefined;
	const badgerPriceDisplay = badgerPrice ? new BigNumber(badgerPrice) : undefined;
	const portfolioValue = userConnected ? stats.stats.portfolio : undefined;

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
						{!!network.rewards && !!connectedAddress && badgerTree && badgerTree.claims.length > 0 ? (
							<RewardsModal />
						) : (
							<> </>
						)}
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

			<SettList />
		</Container>
	);
});

export default Landing;
