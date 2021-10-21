import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Container, Grid, Tabs, Tab, Card } from '@material-ui/core';
import PageHeader from 'components-v2/common/PageHeader';
import { Mint } from './Mint';
import { Redeem } from './Redeem';
import { IbbtcRoi } from './IbbtcRoi';
import { HeaderContainer, LayoutContainer } from '../../components-v2/common/Containers';
import { Network } from '@badger-dao/sdk';

type TABS = 'Mint' | 'Redeem';

const useStyles = makeStyles((theme) => ({
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
	const { network } = store.network;
	const spacer = () => <div className={classes.before} />;

	const Content = () => (
		<Container className={classes.content} maxWidth="lg">
			{activeTab === 'Mint' && <Mint />}
			{activeTab === 'Redeem' && <Redeem />}
		</Container>
	);

	return (
		<LayoutContainer>
			<Grid container spacing={1} justify="center">
				<HeaderContainer item sm={12} xs={12}>
					<PageHeader title="ibBTC" subtitle="Interest Bearing Badger Bitcoin." />
				</HeaderContainer>

				{network.symbol === Network.Ethereum ? (
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
		</LayoutContainer>
	);
});
