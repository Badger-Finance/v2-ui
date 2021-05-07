import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';

import { Container, Grid, Tabs, Tab, Card } from '@material-ui/core';
import { NETWORK_LIST } from 'config/constants';

// Local Components
import PageHeader from 'components-v2/common/PageHeader';
import { Mint } from './Mint';
import { Redeem } from './Redeem';
import { IbbtcRoi } from './IbbtcRoi';

type TABS = 'Mint' | 'Redeem';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(30),
		},
		marginBottom: theme.spacing(4),
	},
	headerContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(6),
	},
	cardContainer: { justifyContent: 'center', display: 'flex' },
	tabHeader: { background: 'rgba(0,0,0,.2)' },
	content: {
		padding: '40px 24px 32px 24px',
	},
	apyInformation: {
		marginBottom: theme.spacing(4),
	},
	before: {
		marginTop: theme.spacing(5),
		width: '100%',
	},
}));

export const IbBTC = observer(() => {
	const classes = useStyles();
	const [activeTab, setActiveTab] = useState<TABS>('Mint');

	const store = useContext(StoreContext);
	const { network } = store.wallet;
	const spacer = () => <div className={classes.before} />;

	const Content = () => (
		<Container className={classes.content} maxWidth="lg">
			{activeTab === 'Mint' && <Mint />}
			{activeTab === 'Redeem' && <Redeem />}
		</Container>
	);

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={1} justify="center">
				<Grid item sm={12} xs={12} className={classes.headerContainer}>
					<PageHeader title="ibBTC" subtitle="Interest Bearing Badger Bitcoin." />
				</Grid>

				{network.name === NETWORK_LIST.ETH ? (
					<>
						<Grid item sm={12} xs={12} md={7} className={classes.apyInformation}>
							<IbbtcRoi />
						</Grid>

						<Grid item sm={12} xs={12} md={7}>
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
								<Content />
							</Card>
						</Grid>
					</>
				) : (
					<>
						<Grid item xs={12}>
							ibBTC minting and redeeming is available on ETH Mainnet only.
						</Grid>
					</>
				)}
				{spacer()}
			</Grid>
		</Container>
	);
});
