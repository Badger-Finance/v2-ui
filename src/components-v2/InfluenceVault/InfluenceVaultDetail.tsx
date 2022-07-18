import { observer } from 'mobx-react-lite';
import React, { useContext, useReducer } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { NETWORK_IDS, NETWORK_IDS_TO_NAMES } from '../../config/constants';
import routes from '../../config/routes';
import { Container, Grid, makeStyles } from '@material-ui/core';
import { Header } from '../vault-detail/Header';
import { Footer } from '../vault-detail/Footer';
import { TopContent } from '../vault-detail/TopContent';
import { Loader } from '../../components/Loader';
import { Holdings } from '../vault-detail/holdings/Holdings';
import { defaultVaultBalance } from '../vault-detail/utils';
import InfluenceVaultInfoPanel from './InfluenceVaultInfoPanel';
import InfluenceVaultSpecs from './InfluenceVaultSpecs';
import { VaultWithdraw } from '../common/dialogs/VaultWithdraw';
import { VaultDeposit } from '../common/dialogs/VaultDeposit';
import { MobileStickyActionButtons } from '../vault-detail/actions/MobileStickyActionButtons';

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

const InfluenceVaultDetail = (): JSX.Element => {
	const {
		network: { network },
		router,
		user,
		vaultDetail,
		vaults,
		wallet,
	} = useContext(StoreContext);

	const { vault } = vaultDetail;

	const classes = useStyles();
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
						<InfluenceVaultSpecs vault={vault} />
					</Grid>
					<Grid item xs={12} md={8} lg={9} className={classes.chartsContainer}>
						<InfluenceVaultInfoPanel vault={vault} />
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

export default observer(InfluenceVaultDetail);
