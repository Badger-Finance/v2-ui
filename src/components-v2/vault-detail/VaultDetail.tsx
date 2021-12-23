import React, { useContext, useEffect, useRef } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { MobileStickyActionButtons } from './actions/MobileStickyActionButtons';
import { Loader } from '../../components/Loader';
import { TopContent } from './TopContent';
import { VaultDeposit } from '../common/dialogs/VaultDeposit';
import { VaultWithdraw } from '../common/dialogs/VaultWithdraw';
import { NotFound } from '../common/NotFound';
import { Footer } from './Footer';
import routes from '../../config/routes';
import IbbtcVaultDepositDialog from '../ibbtc-vault/IbbtcVaultDepositDialog';
import { isVaultVaultIbbtc } from '../../utils/componentHelpers';

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
}));

export const VaultDetail = observer(
	(): JSX.Element => {
		const {
			vaultDetail,
			network: { network },
			router,
		} = useContext(StoreContext);

		const initialNetwork = useRef(network);
		const classes = useStyles();
		const { vault, isLoading, isNotFound, isDepositDialogDisplayed, isWithdrawDialogDisplayed } = vaultDetail;
		const badgerVault = network.vaults.find(({ vaultToken }) => vaultToken.address === vault?.vaultToken);

		useEffect(() => {
			if (network.symbol !== initialNetwork.current.symbol) {
				router.goTo(routes.home);
			}
		}, [network, router]);

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
			return <NotFound />;
		}

		const isIbbtc = vault ? isVaultVaultIbbtc(vault) : false;
		const DepositWidget = isIbbtc ? IbbtcVaultDepositDialog : VaultDeposit;

		return (
			<>
				<Container className={classes.root}>
					<Header />
					{vault && badgerVault && (
						<>
							<TopContent vault={vault} />
							<MainContent vault={vault} badgerVault={badgerVault} />
						</>
					)}
					{badgerVault && <Footer badgerVault={badgerVault} />}
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
	},
);
