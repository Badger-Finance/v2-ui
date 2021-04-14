import React from 'react';
import { observer } from 'mobx-react-lite';
import { Tab, Card, Tabs, CardContent, Container, Grid, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { StoreContext } from 'mobx/store-context';
import Liquidations from './Liquidations';
import Mint from './Mint';
import Manage from './Manage';
import Redeem from './Redeem';
import Withdrawals from './Withdrawals';
import PageHeader from 'components-v2/common/PageHeader';

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: theme.spacing(12),
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	tabs: {
		marginBottom: theme.spacing(1),
		background: 'rgba(0,0,0,.2)',
	},
	cardContent: {
		paddingRight: theme.spacing(2),
		paddingLeft: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			paddingRight: theme.spacing(3),
			paddingLeft: theme.spacing(3),
		},
	},
	loader: {
		textAlign: 'center',
		padding: theme.spacing(20, 0),
	},
}));

const TABS = {
	MINT: 0,
	MANAGE: 1,
	REDEEM: 2,
};

export const Claw = observer(() => {
	const store = React.useContext(StoreContext);
	const { isLoading, sponsorInformation } = store.claw;
	const classes = useStyles();
	const [activeTab, setActiveTab] = React.useState(0);

	const Content = () => {
		if (isLoading) {
			return (
				<Container className={classes.loader}>
					<CircularProgress />
				</Container>
			);
		}

		switch (activeTab) {
			case TABS.REDEEM:
				return <Redeem />;
			case TABS.MANAGE:
				return <Manage />;
			case TABS.MINT:
			default:
				return <Mint />;
		}
	};

	const [totalWithdrawals, totalLiquidations] = sponsorInformation.reduce(
		([numWithdrawals, numLiquidations], { pendingWithdrawal, liquidations }) => {
			if (liquidations) {
				numLiquidations += liquidations.length;
			}
			if (pendingWithdrawal) {
				numWithdrawals++;
			}
			return [numWithdrawals, numLiquidations];
		},
		[0, 0],
	);

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={1} justify="center">
				<Grid item xs={12}>
					<PageHeader title="CLAWs" subtitle="Stablecoin backed by Badger Sett Vaults" />
				</Grid>
				<Grid item xs={12}>
					<Card>
						<Tabs variant="fullWidth" indicatorColor="primary" value={activeTab} className={classes.tabs}>
							<Tab onClick={() => setActiveTab(TABS.MINT)} label="Mint" />
							<Tab onClick={() => setActiveTab(TABS.MANAGE)} label="Manage" />
							<Tab onClick={() => setActiveTab(TABS.REDEEM)} label="Redeem" />
						</Tabs>
						<CardContent className={classes.cardContent}>
							<Content />
						</CardContent>
					</Card>
				</Grid>
				{!isLoading && (
					<Grid item xs={12}>
						{totalWithdrawals > 0 && <Withdrawals />}
						{totalLiquidations > 0 && <Liquidations />}
					</Grid>
				)}
			</Grid>
		</Container>
	);
});
