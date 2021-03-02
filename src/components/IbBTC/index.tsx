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
	tabHeader: { background: 'rgba(0,0,0,.2)' },
}));

export const IbBTC = (): any => {
	const classes = useStyles();
	const allTabs = ['Mint', 'Redeem'];

	const [activeTab, setActiveTab] = useState<string>('Mint');

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={1} justify="center">
				<Grid item sm={12} xs={12}>
					<Hero title="ibBTC" subtitle="Interest Bearing Badger Bitcoin." />
				</Grid>

				<Grid item sm={12} xs={12}>
					<Card className={classes.card}>
						<Tabs
							variant="fullWidth"
							className={classes.tabHeader}
							indicatorColor="primary"
							value={activeTab}
						>
							<Tab onClick={() => setActiveTab(allTabs[0])} value={allTabs[0]} label={allTabs[0]}></Tab>
							<Tab onClick={() => setActiveTab(allTabs[1])} value={allTabs[1]} label={allTabs[1]}></Tab>
						</Tabs>
						{activeTab === allTabs[0] && <Mint />}
						{activeTab === allTabs[1] && <Redeem />}
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
	'@media (max-width: 598px)': {
		inputWrapper: {
			flexDirection: 'column',
			padding: '15px',
		},
		unstylishInput: {
			margin: '12px 0px !important',
		},
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
		'&, &:focus, &:active, &[type="number"]': {
			border: 'none',
			borderWidth: '0px',
			outlineOffset: '0px',
			outlineColor: 'transparent',
			outlineStyle: 'none',

			boxShadow: 'none',
			backgroundImage: 'none',
			backgroundColor: 'transparent',

			'-webkit-box-shadow': 'none',
			'-moz-box-shadow': 'none',
			'-moz-appearance': 'textfield',
		},
		'&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
			'-webkit-appearance': 'none',
			margin: 0,
		},
		'&::-webkit-input-placeholder, &::-moz-placeholder, &:-ms-input-placeholder, &:-moz-placeholder': {
			color: '#afafaf',
		},
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
		'& h6:last-child': {
			textAlign: 'end',
		},
		'& h6:first-child': {
			textAlign: 'start',
		},
	},
}));
