import { observer } from 'mobx-react-lite';
import React, { useContext, useReducer } from 'react';
import { StoreContext } from '../mobx/store-context';
import { NETWORK_IDS, NETWORK_IDS_TO_NAMES } from '../config/constants';
import routes from '../config/routes';
import { Container, Grid, makeStyles } from '@material-ui/core';
import { Header } from '../components-v2/vault-detail/Header';
import mainnetDeploy from 'config/deployments/mainnet.json';
import { Footer } from '../components-v2/vault-detail/Footer';
import { TopContent } from '../components-v2/vault-detail/TopContent';
import { Loader } from '../components/Loader';
import { Holdings } from '../components-v2/vault-detail/holdings/Holdings';
import { defaultVaultBalance } from '../components-v2/vault-detail/utils';
import BveCvxInfoPanels from '../components-v2/BveCvxInfoPanels';
import BveCvxSpecs from '../components-v2/BveCvxSpecs';
import { VaultWithdraw } from '../components-v2/common/dialogs/VaultWithdraw';
import { VaultDeposit } from '../components-v2/common/dialogs/VaultDeposit';
import { MobileStickyActionButtons } from '../components-v2/vault-detail/actions/MobileStickyActionButtons';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingTop: theme.spacing(0.5),
		marginTop: theme.spacing(2),
		[theme.breakpoints.down('xs')]: {
			paddingBottom: theme.spacing(6),
		},
	},
	notReadyContainer: {
		textAlign: 'center',
		marginTop: theme.spacing(10),
	},
	holdingsContainer: {
		marginBottom: 20,
	},
	chartsContainer: {
		[theme.breakpoints.down('sm')]: {
			minHeight: 600,
		},
	},
}));

const vaultAddress = mainnetDeploy.sett_system.vaults['native.icvx'];

const BveCvxInfluence = (): JSX.Element => {
	const {
		network: { network },
		router,
		user,
		vaults,
		wallet,
	} = useContext(StoreContext);

	const classes = useStyles();
	const vault = vaults.getVault(vaultAddress);
	const badgerVault = vault ? vaults.getVaultDefinition(vault) : undefined;
	const [depositDisplayed, toggleDepositDisplayed] = useReducer((previous) => !previous, false);
	const [withdrawDisplayed, toggleWithdrawDisplay] = useReducer((previous) => !previous, false);

	if (network.id !== NETWORK_IDS.ETH) {
		router.goTo(routes.home, {}, { chain: NETWORK_IDS_TO_NAMES[NETWORK_IDS.ETH] });
	}

	if (!vault || !badgerVault) {
		return (
			<Container className={classes.root}>
				<div className={classes.notReadyContainer}>
					<Loader message="Loading Vault Information" />
				</div>
			</Container>
		);
	}

	const userData = user.accountDetails?.data[vault.vaultToken] ?? defaultVaultBalance(vault);

	return (
		<>
			<Container className={classes.root}>
				<Header />
				<TopContent vault={vault} />
				{wallet.isConnected && (
					<Grid container className={classes.holdingsContainer}>
						<Holdings
							vault={vault}
							userData={userData}
							onDepositClick={toggleDepositDisplayed}
							onWithdrawClick={toggleWithdrawDisplay}
						/>
					</Grid>
				)}
				<Grid container spacing={1}>
					<Grid item xs={12} md={4} lg={3}>
						<BveCvxSpecs vault={vault} />
					</Grid>
					<Grid item xs={12} md={8} lg={9} className={classes.chartsContainer}>
						<BveCvxInfoPanels vault={vault} />
					</Grid>
				</Grid>
				<Footer vault={vault} />
			</Container>
			<MobileStickyActionButtons
				vault={vault}
				onDepositClick={toggleDepositDisplayed}
				onWithdrawClick={toggleWithdrawDisplay}
			/>
			<VaultDeposit
				open={depositDisplayed}
				vault={vault}
				badgerVault={badgerVault}
				onClose={toggleDepositDisplayed}
			/>
			<VaultWithdraw
				open={withdrawDisplayed}
				vault={vault}
				badgerVault={badgerVault}
				onClose={toggleWithdrawDisplay}
			/>
		</>
	);
};

export default observer(BveCvxInfluence);