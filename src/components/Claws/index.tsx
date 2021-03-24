import React, { FC, useContext, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
	Tab,
	Card,
	Tabs,
	CardContent,
	Container,
	Grid,
	CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { StoreContext } from 'mobx/store-context';
import { SponsorData } from 'mobx/stores/clawStore';
import Hero from 'components/Common/Hero';
import Liquidations from './Liquidations';
import Mint from './Mint';
import Manage from './Manage';
import Redeem from './Redeem';
import Withdrawals from './Withdrawals';

export enum INVALID_REASON {
	OVER_MAXIMUM = 'EXCEED',
	UNDER_MINIMUM = 'NOT_MINIMUM',
}

// SkipError specifies which errors to skip when calling the useError fn.
export interface SkipError {
        noToken?: string;
        amount?: string;
        balance?: string;
}

export interface ClawParam {
	amount?: string;
	selectedOption?: string;
	error?: INVALID_REASON;
}

export const useMainStyles = makeStyles((theme) => ({
	root: {
		marginBottom: theme.spacing(12),
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	tabs: {
		marginBottom: theme.spacing(1),
	},
	cardContent: {
		paddingRight: theme.spacing(2),
		paddingLeft: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			paddingRight: theme.spacing(3),
			paddingLeft: theme.spacing(3),
		},
	},
	details: {
		width: '50%',
		marginTop: theme.spacing(2),
		margin: 'auto',
		[theme.breakpoints.only('xs')]: {
			width: '80%',
		},
	},
	button: {
		width: '80%',
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(2),
		margin: 'auto',
		[theme.breakpoints.only('xs')]: {
			width: '100%',
		},
	},
	loader: {
		textAlign: 'center',
		padding: theme.spacing(20, 0),
	},
}));

const TABS = {
	MINT: 0,
	MANAGE: 1,
	REDEEM: 2,
};

export const Claws: FC = observer(() => {
	const { claw: store } = useContext(StoreContext);
	const { isLoading, sponsorInformationByEMP, syntheticsData } = store;
	const classes = useMainStyles();
	const [activeTab, setActiveTab] = useState(0);

	const Content = () => {
		if (isLoading) {
			return (
				<Container className={classes.loader}>
					<CircularProgress />
				</Container>
			);
		}

		switch (activeTab) {
			case TABS.REDEEM:
				return <Redeem />;
			case TABS.MANAGE:
				return <Manage />;
			case TABS.MINT:
			default:
				return <Mint />;
		}
	};
        const totalWithdrawals = Object.values(toJS(sponsorInformationByEMP))
                .reduce((acc: number, { pendingWithdrawal }: SponsorData) => {
                        console.log(pendingWithdrawal);
                        if (pendingWithdrawal) return acc + 1;
                        return acc;
                }, 0);
        const totalLiquidations = Object.values(toJS(sponsorInformationByEMP))
                .reduce((acc: number, { liquidations }: SponsorData) => {
                        if (liquidations) return acc + liquidations.length;
                        return acc;
                }, 0);

        console.log(totalWithdrawals, totalLiquidations);
        console.log(toJS(sponsorInformationByEMP));
	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={1} justify="center">
				<Grid item xs={12}>
					<Hero title="CLAWs" subtitle="Stablecoin backed by Badger Sett Vaults" />
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
						<CardContent className={classes.cardContent}>
							<Content />
						</CardContent>
					</Card>
				</Grid>
				{totalWithdrawals + totalLiquidations > 0 ? (
					<Grid item xs={12}>
						{totalWithdrawals > 0 ? <Withdrawals/> : null}
						{totalLiquidations > 0 ? <Liquidations/> : null}
					</Grid>
				) : null}
			</Grid>
		</Container>
	);
});
