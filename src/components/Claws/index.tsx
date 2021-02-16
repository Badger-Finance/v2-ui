import React, { useState } from 'react';
import { Tab, Card, Tabs, CardContent, Container, Grid, Switch, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Hero from 'components/Common/Hero';
import { Mint } from './Mint';

const TABS = {
	MINT: 0,
	MANAGE: 1,
	REDEEM: 2,
};

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	tabs: {
		marginBottom: theme.spacing(1),
	},
}));

export const Claws = () => {
	const classes = useStyles();
	const [activeTab, setActiveTab] = useState(0);
	const [globalData, setGlobalData] = useState(false);

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={1} justify="center">
				<Grid item xs={12}>
					<Hero title="CLAWs" subtitle="Stablecoin backed by Badger Sett Vaults" />
				</Grid>
				<Grid item xs={12}>
					<FormControlLabel
						label="Global Data"
						control={
							<Switch
								checked={globalData}
								onChange={() => {
									setGlobalData(!globalData);
								}}
								color="primary"
							/>
						}
					/>
				</Grid>
				<Grid item xs={12}>
					<Card>
						<Tabs
							variant="fullWidth"
							indicatorColor="primary"
							value={activeTab}
							style={{ background: 'rgba(0,0,0,.2)', marginBottom: '.5rem' }}
						>
							<Tab onClick={() => setActiveTab(TABS.MINT)} label="Mint"></Tab>
							<Tab onClick={() => setActiveTab(TABS.MANAGE)} label="Manage"></Tab>
							<Tab onClick={() => setActiveTab(TABS.REDEEM)} label="Redeem"></Tab>
						</Tabs>
						<CardContent>
							<Mint />
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Container>
	);
};
