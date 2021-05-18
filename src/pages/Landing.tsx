import CurrencyInfoCard from '../components-v2/common/CurrencyInfoCard';
import CurrencyPicker from '../components-v2/landing/CurrencyPicker';
import SamplePicker from '../components-v2/landing/SamplePicker';
import WalletSlider from '../components-v2/landing/WalletSlider';
import { Grid, Container, makeStyles, Button } from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';

import { StoreContext } from '../mobx/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import BigNumber from 'bignumber.js';
import SettList from 'components-v2/landing/SettList';
import { RewardsModal } from '../components-v2/landing/RewardsModal';

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
		display: 'flex',
		flexDirection: 'column',
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
	walletContainer: {
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(1),
		},
	},
	pickerContainer: {
		display: 'flex',
		marginRight: theme.spacing(1),
		alignItems: 'flex-end',
		[theme.breakpoints.down('xs')]: {
			marginBottom: theme.spacing(2),
			marginTop: theme.spacing(-1),
		},
	},
	announcementButton: {
		marginTop: theme.spacing(3),
		pointerEvents: 'none',
	},
}));

interface LandingProps {
	experimental: boolean;
}

const Landing = observer((props: LandingProps) => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { experimental } = props;

	const {
		wallet: { connectedAddress, network },
		rewards: { badgerTree },
		uiState: { currency },
		setts,
		user,
	} = store;
	const { protocolSummary } = setts;
	const userConnected = !!connectedAddress;

	const totalValueLocked = protocolSummary ? new BigNumber(protocolSummary.totalValue) : undefined;
	const badgerPrice = network.deploy ? setts.getPrice(network.deploy.token) : undefined;
	const portfolioValue = userConnected && !user.loadingBalances ? user.portfolioValue() : undefined;

	const hasRewards = new Boolean(!!network.rewards && !!connectedAddress && badgerTree && badgerTree.claims);
	return (
		<Container className={classes.landingContainer}>
			{/* Landing Metrics Cards */}
			<Grid container spacing={1} justify="center">
				<Grid item xs={12} className={classes.headerContainer}>
					{experimental ? (
						<PageHeader title="Experimental Vaults" subtitle="New vaults to dip your toes in.  Ape safe." />
					) : (
						<PageHeader
							title="Sett Vaults"
							subtitle="Powerful Bitcoin strategies. Automatic staking rewards."
						/>
					)}
				</Grid>
				<Grid item xs={12} className={classes.widgetContainer}>
					<div className={classes.walletContainer}>{userConnected && <WalletSlider />}</div>
					<div className={classes.pickerContainer}>
						{hasRewards && <RewardsModal />}
						<SamplePicker />
						<CurrencyPicker />
					</div>
				</Grid>
				<Grid item xs={12} md={userConnected ? 4 : 6}>
					<CurrencyInfoCard title="Total Value Locked" value={totalValueLocked} currency={currency} />
				</Grid>
				{userConnected && (
					<Grid item xs={12} md={4}>
						<CurrencyInfoCard title="Your Portfolio" value={portfolioValue} currency={currency} />
					</Grid>
				)}
				<Grid item xs={12} md={userConnected ? 4 : 6}>
					<CurrencyInfoCard title="Badger Price" value={badgerPrice} currency={currency} />
				</Grid>
			</Grid>

			<Grid container spacing={1} justify="center">
				<Button className={classes.announcementButton} size="small" variant="outlined" color="primary">
					Note: New Vaults may take up to 2 weeks from launch to reach full efficiency.
				</Button>
			</Grid>

			<SettList experimental={experimental} />
		</Container>
	);
});

export default Landing;
