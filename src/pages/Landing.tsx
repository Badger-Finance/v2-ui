import CurrencyInfoCard from '../components-v2/common/CurrencyInfoCard';
import CurrencyPicker from '../components-v2/landing/CurrencyPicker';
import SamplePicker from '../components-v2/landing/SamplePicker';
import WalletSlider from '../components-v2/landing/WalletSlider';
import { Grid, Container, makeStyles } from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';
import { SettList } from '../components/Collection/Setts';
import { StoreContext } from '../mobx/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import BigNumber from 'bignumber.js';

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
	pickerContainer: {
		marginRight: theme.spacing(1),
	},
}));

const Landing = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		wallet: { connectedAddress, isCached },
		sett: { assets, badger },
		uiState: { stats, currency, hideZeroBal },
	} = store;
	const userConnected = !!connectedAddress;

	// force convert tvl due to zero typing on store (remove once typed)
	const totalValueLocked: BigNumber | undefined = assets.totalValue ? new BigNumber(assets.totalValue) : undefined;

	// force undefined on $0 badger, value starts at 0 vs. undefined
	const badgerPrice: number | undefined = badger.market_data ? badger.market_data.current_price.usd : undefined;
	const badgerDisplayPrice: BigNumber | undefined = badgerPrice ? new BigNumber(badgerPrice) : undefined;

	const portfolioValue = userConnected ? stats.stats.portfolio : undefined;

	return (
		<Container className={classes.landingContainer}>
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
					<CurrencyInfoCard
						title="Badger Price"
						value={badgerDisplayPrice}
						currency={currency}
						isUsd={true}
					/>
				</Grid>
			</Grid>
			<SettList isGlobal={!isCached()} hideEmpty={hideZeroBal} />
		</Container>
	);
});

export default Landing;
