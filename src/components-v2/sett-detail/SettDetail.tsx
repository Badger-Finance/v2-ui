import React, { useContext, useEffect, useRef } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { MobileStickyActionButtons } from './actions/MobileStickyActionButtons';
import { Loader } from '../../components/Loader';
import { TopContent } from './TopContent';
import { SettDeposit } from '../common/dialogs/SettDeposit';
import { SettWithdraw } from '../common/dialogs/SettWithdraw';
import { NotFound } from '../common/NotFound';
import { Footer } from './Footer';
import routes from '../../config/routes';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingTop: theme.spacing(0.5),
		marginTop: theme.spacing(2),
	},
	notReadyContainer: {
		textAlign: 'center',
		marginTop: theme.spacing(10),
	},
}));

export const SettDetail = observer(
	(): JSX.Element => {
		const {
			settDetail,
			network: { network },
			router,
		} = useContext(StoreContext);

		const initialNetwork = useRef(network);
		const classes = useStyles();
		const { sett, isLoading, isNotFound, isDepositDialogDisplayed, isWithdrawDialogDisplayed } = settDetail;
		const badgerSett = network.setts.find(({ vaultToken }) => vaultToken.address === sett?.settToken);

		useEffect(() => {
			if (network.symbol !== initialNetwork.current.symbol) {
				router.goTo(routes.home);
			}
		}, [network, router]);

		if (isLoading) {
			return (
				<Container className={classes.root}>
					<div className={classes.notReadyContainer}>
						<Loader message="Loading Sett Information" />
					</div>
				</Container>
			);
		}

		if (isNotFound) {
			return <NotFound />;
		}

		return (
			<>
				<Container className={classes.root}>
					<Header />
					{sett && badgerSett && (
						<>
							<TopContent sett={sett} />
							<MainContent sett={sett} badgerSett={badgerSett} />
						</>
					)}
					{badgerSett && <Footer badgerSett={badgerSett} />}
				</Container>
				<MobileStickyActionButtons />
				{sett && badgerSett && (
					<>
						<SettDeposit
							open={isDepositDialogDisplayed}
							sett={sett}
							badgerSett={badgerSett}
							onClose={() => settDetail.toggleDepositDialog()}
						/>
						<SettWithdraw
							open={isWithdrawDialogDisplayed}
							sett={sett}
							badgerSett={badgerSett}
							onClose={() => settDetail.toggleWithdrawDialog()}
						/>
					</>
				)}
			</>
		);
	},
);
