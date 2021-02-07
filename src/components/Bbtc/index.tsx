import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Grid, Tabs, Tab, Card } from '@material-ui/core';

// Local Components
import Hero from 'components/Common/Hero';
import { Mint } from './Mint';
import { Redeem } from './Redeem';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		alignItems: 'center',
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	card: {
		maxWidth: '640px',
	},
}));

export const Bbtc = (): any => {
	const classes = useStyles();

	const [title, setViewSelected] = useState<string>('Mint');

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={1} justify="center">
				<Grid item sm={12} xs={12}>
					<Hero title="BBTC" subtitle="Pegged to Bitcoin using Defi Primitives. Governed by BadgerDAO." />
				</Grid>

				<Grid item sm={12} xs={12}>
					<Card className={classes.card}>
						<Tabs
							variant="fullWidth"
							indicatorColor="primary"
							value={['Mint', 'Redeem'].indexOf(title)}
							style={{ background: 'rgba(0,0,0,.2)', marginBottom: '.5rem' }}
						>
							<Tab onClick={() => setViewSelected('Mint')} label="Mint"></Tab>
							<Tab onClick={() => setViewSelected('Redeem')} label="Redeem"></Tab>
						</Tabs>
						{title === 'Mint' && <Mint />}
						{title === 'Redeem' && <Redeem />}
					</Card>
				</Grid>
			</Grid>
		</Container>
	);
};
