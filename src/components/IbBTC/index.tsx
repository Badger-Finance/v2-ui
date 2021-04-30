import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Grid, Tabs, Tab, Card } from '@material-ui/core';

// Local Components
import PageHeader from 'components-v2/common/PageHeader';
import { Mint } from './Mint';
import { Redeem } from './Redeem';
import { TokenApy } from '../../components-v2/common/TokenApy';
import { StoreContext } from '../../mobx/store-context';

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
}));

export const IbBTC = observer((): any => {
	const { ibBTCStore } = React.useContext(StoreContext);
	const classes = useStyles();
	const [activeTab, setActiveTab] = useState<TABS>('Mint');

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

				<Grid item sm={12} xs={12} md={7} className={classes.apyInformation}>
					<TokenApy
						name={ibBTCStore.ibBTC.symbol}
						logo={ibBTCStore.ibBTC.icon.default}
						apyFromLastDay={
							ibBTCStore.apyInfo ? ibBTCStore.apyInfo.fromLastDay.toFixed(3) + '%' : undefined
						}
						apyFromLastWeek={
							ibBTCStore.apyInfo ? ibBTCStore.apyInfo.fromLastWeek.toFixed(3) + '%' : undefined
						}
					/>
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
			</Grid>
		</Container>
	);
});
