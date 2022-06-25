import React, { useContext } from 'react';
import { Button, Container, Grid, makeStyles } from '@material-ui/core';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { MobileStickyActionButtons } from './actions/MobileStickyActionButtons';
import { Loader } from '../../components/Loader';
import { TopContent } from './TopContent';
import { VaultDeposit } from '../common/dialogs/VaultDeposit';
import { VaultWithdraw } from '../common/dialogs/VaultWithdraw';
import { Footer } from './Footer';
import IbbtcVaultDepositDialog from '../ibbtc-vault/IbbtcVaultDepositDialog';
import { isVaultVaultIbbtc } from '../../utils/componentHelpers';
import routes from '../../config/routes';

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
	notFoundImage: {
		marginTop: theme.spacing(10),
	},
}));

export const VaultDetail = observer((): JSX.Element => {
	const { vaultDetail, vaults, router } = useContext(StoreContext);
	const classes = useStyles();
	const { vault, isLoading, isNotFound, isDepositDialogDisplayed, isWithdrawDialogDisplayed } = vaultDetail;
	const badgerVault = vault ? vaults.getVaultDefinition(vault) : undefined;

	const goBackHome = () => {
		router.goTo(routes.home, {}, { chain: router.queryParams?.chain });
	};

	if (isLoading) {
		return (
			<Container className={classes.root}>
				<div className={classes.notReadyContainer}>
					<Loader message="Loading Vault Information" />
				</div>
			</Container>
		);
	}

	if (isNotFound) {
		return (
			<Container>
				<Grid container direction="column" justifyContent="center" alignItems="center">
					<Grid item className={classes.notFoundImage}>
						<img src="/assets/icons/not-found-404.png" alt="not-found" />
					</Grid>
					<Grid item>
						<Button variant="outlined" color="primary" onClick={goBackHome}>
							Go Back to All Vaults
						</Button>
					</Grid>
				</Grid>
			</Container>
		);
	}

	const isIbbtc = vault ? isVaultVaultIbbtc(vault) : false;
	const DepositWidget = isIbbtc ? IbbtcVaultDepositDialog : VaultDeposit;

	return (
		<>
			<Container className={classes.root}>
				<Header />
				{vault && (
					<>
						<>
							<TopContent vault={vault} />
							<MainContent vault={vault} />
						</>
						<Footer vault={vault} />
					</>
				)}
			</Container>
			<MobileStickyActionButtons />
			{vault && badgerVault && (
				<>
					<DepositWidget
						open={isDepositDialogDisplayed}
						vault={vault}
						badgerVault={badgerVault}
						onClose={() => vaultDetail.toggleDepositDialog()}
					/>
					<VaultWithdraw
						open={isWithdrawDialogDisplayed}
						vault={vault}
						badgerVault={badgerVault}
						onClose={() => vaultDetail.toggleWithdrawDialog()}
					/>
				</>
			)}
		</>
	);
});
