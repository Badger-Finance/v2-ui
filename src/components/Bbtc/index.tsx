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

export const debounce = (n: number, fn: (...params: any[]) => any, immediate = false): any => {
	let timer: any = undefined;
	return function (this: any, ...args: any[]) {
		if (timer === undefined && immediate) {
			fn.apply(this, args);
		}
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), n);
		return timer;
	};
};

export const commonStyles = makeStyles(() => ({
	root: {
		padding: '40px 24px 32px 24px',
	},
	outerWrapper: {
		display: 'flex',
		flexDirection: 'column',
	},
	balance: {
		textAlign: 'right',
		marginBottom: '16px',
	},
	inputWrapper: {
		display: 'flex',
		border: '1px solid #6B6B6B',
		boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
		borderRadius: '9px',
		padding: '18px 20px',
		minHeight: '82px',
	},
	btnMax: {
		alignSelf: 'center',
		marginLeft: 'auto',
		fontSize: '12px',
		lineHeight: '16px',
	},
	unstylishInput: {
		color: 'white',
		fontSize: '18px',
		lineHeight: '20px',
		margin: '0px 20px 0px 16px',
		width: '100%',
	},
	arrowDown: {
		margin: '24px auto -5px',
	},
	token: {
		display: 'flex',
	},
	tokenIcon: {
		height: '30px',
		width: '30px',
		alignSelf: 'center',
	},
	tokenLabel: {
		alignSelf: 'center',
		margin: '0px 8px 0px 14px',
	},
	summaryWrapper: {
		background: 'rgba(20, 20, 20, 0.5)',
		boxShadow: '0px 0.913793px 3.65517px rgba(0, 0, 0, 0.08)',
		margin: '32px -24px',
		padding: '20px 50px',
	},
	summaryRow: {
		display: 'flex',
		justifyContent: 'space-between',
	},
}));
