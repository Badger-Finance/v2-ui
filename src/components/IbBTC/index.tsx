import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Grid, Tabs, Tab, Card } from '@material-ui/core';

// Local Components
import PageHeader from 'components-v2/common/PageHeader';
import { Mint } from './Mint';
import { Redeem } from './Redeem';

type TABS = 'Mint' | 'Redeem';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(30),
		},
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
}));

export const IbBTC = (): any => {
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
};
