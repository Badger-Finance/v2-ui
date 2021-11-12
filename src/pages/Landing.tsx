import CurrencyPicker from '../components-v2/landing/CurrencyPicker';
import WalletSlider from '../components-v2/landing/WalletSlider';
import { Grid, makeStyles, Button } from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';
import { StoreContext } from '../mobx/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { PageHeaderContainer, LayoutContainer } from '../components-v2/common/Containers';
import { SettState } from '@badger-dao/sdk';
import SettListView from '../components-v2/landing/SettListView';
import DepositDialog from '../components-v2/ibbtc-vault/DepositDialog';

const useStyles = makeStyles((theme) => ({
	marginTop: {
		marginTop: theme.spacing(3),
	},
	rewardContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
		marginLeft: 'auto',
		marginRight: 'auto',
		display: 'flex',
		flexDirection: 'column',
	},
	widgetContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		height: '2.2rem',
		marginBottom: theme.spacing(1),
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: theme.spacing(3),
		},
	},
	rewardText: {
		marginRight: theme.spacing(3),
		textAlign: 'left',
	},
	statPaper: {
		padding: theme.spacing(2),
	},
	rewardItem: {
		padding: 0,
		flexWrap: 'wrap',
	},
	walletContainer: {
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(1),
		},
	},
	pickerContainer: {
		display: 'flex',
		marginRight: theme.spacing(1),
		alignItems: 'flex-end',
		[theme.breakpoints.down('xs')]: {
			marginBottom: theme.spacing(2),
			marginTop: theme.spacing(-1),
		},
	},
	announcementButton: {
		marginTop: theme.spacing(3),
		pointerEvents: 'none',
	},
	linkButton: {
		marginTop: theme.spacing(3),
		marginRight: 'auto',
		marginLeft: 'auto',
	},
	delegationBanner: {
		marginTop: theme.spacing(3),
	},
}));

interface LandingProps {
	title: string;
	subtitle?: string;
	state: SettState;
}

const Landing = observer((props: LandingProps) => {
	const {
		wallet: { connectedAddress },
	} = useContext(StoreContext);

	const { title, subtitle, state } = props;
	const classes = useStyles();

	return (
		<LayoutContainer>
			{/* Landing Metrics Cards */}
			<Grid container spacing={1} justify="center">
				<PageHeaderContainer item container xs={12}>
					<Grid item xs={6}>
						<PageHeader title={title} subtitle={subtitle} />
					</Grid>
					<Grid item container xs={6} alignItems="center" justify="flex-end">
						<CurrencyPicker />
						{!!connectedAddress && <WalletSlider />}
					</Grid>
				</PageHeaderContainer>
			</Grid>

			{state === SettState.Guarded && (
				<Grid container spacing={1} justify="center">
					<Button className={classes.announcementButton} size="small" variant="outlined" color="primary">
						Note: New Vaults may take up to 2 weeks from launch to reach full efficiency.
					</Button>
				</Grid>
			)}

			<DepositDialog />
			<SettListView state={state} />
		</LayoutContainer>
	);
});

export default Landing;
