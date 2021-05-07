import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Grid, Tabs, Tab, Card } from '@material-ui/core';

// Local Components
import PageHeader from 'components-v2/common/PageHeader';
import { Mint } from './Mint';
import { Redeem } from './Redeem';
// import { IbbtcRoi } from './IbbtcRoi';

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
	card: {},
	tabHeader: { background: 'rgba(0,0,0,.2)' },
}));

export const IbBTC = (): any => {
	const classes = useStyles();
	const allTabs = ['Mint', 'Redeem'];

	const [activeTab, setActiveTab] = useState<string>('Mint');

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={1} justify="center">
				<Grid item sm={12} xs={12} className={classes.headerContainer}>
					<PageHeader title="ibBTC" subtitle="Interest Bearing Badger Bitcoin." />
				</Grid>

				{network.name === NETWORK_LIST.ETH ? (
					<>
						{/*<Grid item sm={12} xs={12} md={7} className={classes.apyInformation}>*/}
						{/*	<IbbtcRoi />*/}
						{/*</Grid>*/}

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
		marginBottom: '.4rem',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
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
		marginRight: '.6rem',
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
		padding: '1.7rem',
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
