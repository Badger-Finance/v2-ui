import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Container, Grid, Tabs, Tab, Card, Link, Paper } from '@material-ui/core';
import PageHeader from 'components-v2/common/PageHeader';
import { Mint } from './Mint';
import { Redeem } from './Redeem';
import { PageHeaderContainer, LayoutContainer } from '../../components-v2/common/Containers';
import { Network } from '@badger-dao/sdk';
import WrapTextIcon from '@material-ui/icons/WrapText';

type TABS = 'Mint' | 'Redeem';

const useStyles = makeStyles((theme) => ({
	cardContainer: { justifyContent: 'center', display: 'flex' },
	tabHeader: { background: 'rgba(0,0,0,.2)' },
	content: {
		padding: theme.spacing(2),
	},
	apyInformation: {
		marginBottom: theme.spacing(4),
	},
	mintContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		flexGrow: 1,
		marginBottom: theme.spacing(6),
	},
	wrapGuide: {
		display: 'flex',
		flexDirection: 'column',
		color: theme.palette.text.secondary,
		marginBottom: theme.spacing(2),
		padding: theme.spacing(2),
		alignItems: 'center',
	},
	wrapGuideIcon: {
		color: theme.palette.primary.main,
		height: '22px',
		width: '22px',
		marginRight: theme.spacing(1),
	},
	wrapGuideLink: {
		marginLeft: 3,
	},
	guideContainer: {
		display: 'flex',
		justifyContent: 'center',
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		},
	},
}));

export const IbBTC = observer(() => {
	const classes = useStyles();
	const [activeTab, setActiveTab] = useState<TABS>('Mint');

	const store = useContext(StoreContext);
	const { network } = store.network;

	const content = (
		<Container className={classes.content} maxWidth="lg">
			{activeTab === 'Mint' && <Mint />}
			{activeTab === 'Redeem' && <Redeem />}
		</Container>
	);

	return (
		<LayoutContainer>
			<Grid container spacing={1} justifyContent="center">
				<PageHeaderContainer item sm={12} xs={12}>
					<PageHeader title="ibBTC" subtitle="Interest Bearing Badger Bitcoin." />
				</PageHeaderContainer>
				{network.symbol === Network.Ethereum ? (
					<div className={classes.mintContainer}>
						<Grid item xs={12} md={9} lg={7}>
							<Paper className={classes.wrapGuide}>
								<div className={classes.guideContainer}>
									<WrapTextIcon fontSize="inherit" className={classes.wrapGuideIcon} />
									<span>
										Wrap your ibBTC to deposit into Curve. Read our{' '}
										<Link
											href="https://docs.badger.com/badger-finance/user-guides/ibbtc-sbtc-curve-lp"
											className={classes.wrapGuideLink}
										>
											ibBTC User Guide
										</Link>
									</span>
								</div>
								<span>
									View the{' '}
									<Link href="https://wrap.badger.com" className={classes.wrapGuideLink}>
										Badger ibBTC Wrapper
									</Link>
								</span>
							</Paper>
						</Grid>
						<Grid item xs={12} md={9} lg={7}>
							<Card>
								<Tabs
									variant="fullWidth"
									className={classes.tabHeader}
									textColor="primary"
									aria-label="IbBTC Tabs"
									indicatorColor="primary"
									value={activeTab}
								>
									<Tab onClick={() => setActiveTab('Mint')} value={'Mint'} label={'Mint'} />
									<Tab onClick={() => setActiveTab('Redeem')} value={'Redeem'} label={'Redeem'} />
								</Tabs>
								{content}
							</Card>
						</Grid>
						{/* Removed per Tritium as of 17-11-2021, re-enable once less flaky, or ibbtc basket updated. cc: @jintao */}
						{/* <Grid item xs={12} md={9} lg={7} className={classes.apyInformation}>
							<IbbtcRoi />
						</Grid> */}
					</div>
				) : (
					<>
						<Grid item xs={12}>
							ibBTC minting and redeeming is available on ETH Mainnet only.
						</Grid>
					</>
				)}
			</Grid>
		</LayoutContainer>
	);
});
