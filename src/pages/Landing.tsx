import CurrencyInfoCard from '../components-v2/common/CurrencyInfoCard';
import CurrencyPicker from '../components-v2/landing/CurrencyPicker';
import SamplePicker from '../components-v2/landing/SamplePicker';
import WalletSlider from '../components-v2/landing/WalletSlider';
import { Grid, makeStyles, Button } from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';
import { StoreContext } from '../mobx/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import SettList from 'components-v2/landing/SettList';
import { RewardsModal } from '../components-v2/landing/RewardsModal';
import { HeaderContainer, LayoutContainer } from '../components-v2/common/Containers';
import CvxDelegationBanner from '../components-v2/locked-cvx-bribes/Banner';
import { SettState } from '@badger-dao/sdk';
import { BigNumber } from 'ethers';

const useStyles = makeStyles((theme) => ({
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
	linkButton: {
		marginTop: theme.spacing(3),
	},
	delegationBanner: {
		marginTop: theme.spacing(3),
	},
}));

interface LandingProps {
	title: string;
	subtitle?: string;
	state: SettState;
}

const Landing = observer((props: LandingProps) => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { title, subtitle, state } = props;

	const {
		wallet: { connectedAddress },
		network: { network },
		setts,
		prices,
		user,
	} = store;
	const { protocolSummary } = setts;
	const userConnected = !!connectedAddress;

	const badgerToken = network.deploy.token.length > 0 ? network.deploy.token : undefined;
	const totalValueLocked = protocolSummary ? BigNumber.from(protocolSummary.totalValue) : undefined;
	const badgerPrice = badgerToken ? prices.getPrice(badgerToken) : undefined;
	const portfolioValue = userConnected && user.initialized ? user.portfolioValue : undefined;

	return (
		<LayoutContainer>
			{/* Landing Metrics Cards */}
			<Grid container spacing={1} justify="center">
				<HeaderContainer item xs={12}>
					<PageHeader title={title} subtitle={subtitle} />
				</HeaderContainer>
				<Grid item xs={12} className={classes.widgetContainer}>
					<div className={classes.walletContainer}>{userConnected && <WalletSlider />}</div>
					<div className={classes.pickerContainer}>
						<RewardsModal />
						<SamplePicker />
						<CurrencyPicker />
					</div>
				</Grid>
				<Grid item xs={12} md={userConnected ? 4 : 6}>
					<CurrencyInfoCard title="Total Value Locked" value={totalValueLocked} />
				</Grid>
				{userConnected && (
					<Grid item xs={12} md={4}>
						<CurrencyInfoCard title="Your Portfolio" value={portfolioValue} />
					</Grid>
				)}
				<Grid item xs={12} md={userConnected ? 4 : 6}>
					<CurrencyInfoCard title="Badger Price" value={badgerPrice} />
				</Grid>
			</Grid>

			{state === SettState.Guarded && (
				<Grid container spacing={1} justify="center">
					<Button className={classes.announcementButton} size="small" variant="outlined" color="primary">
						Note: New Vaults may take up to 2 weeks from launch to reach full efficiency.
					</Button>
				</Grid>
			)}

			{state === SettState.Open && (
				<Grid container className={classes.delegationBanner}>
					<CvxDelegationBanner />
				</Grid>
			)}

			<SettList state={state} />
		</LayoutContainer>
	);
});

export default Landing;
